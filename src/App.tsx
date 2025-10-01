import { useState, useEffect } from 'react'
import logoImage from './img/logo.jpg'
import banner1 from './img/banner1.jpg'
import banner2 from './img/banner2.jpg'
import banner3 from './img/banner3.jpg'
// import IGLogo from './img/IG.png' // Comentado - no se usa en la versión optimizada
// import FBLogo from './img/FB.png' // Comentado - no se usa en la versión optimizada
// import promoVideo from './assets/promo.mp4' // Comentado - no se usa en la versión optimizada
import { enviarLeadAFacturaPro, validarConfiguracionAPI } from './services/leadService'
import { debugSupabaseAuth } from './utils/supabaseHelper'

const professionalInfo = {
  name: 'Tu Guía Digital',
  title: 'Especialistas en talleres de tecnología',
  description: 'Más de 3 años de experiencia en cursos y talleres sabatinos en tecnología.',
  location: {
    text: 'San Juan, PR',
    maps: 'https://maps.app.goo.gl/RdWtajo13S1nbTvs6'
  },
  email: 'tuguiadigital12@gmail.com',
  phone: '9392283101',
  whatsapp: '9392283101',
  website: 'https://tuguiadigital.netlify.app', // URL de la página web
  feedbacks: [
    {
      id: 1,
      image: banner1,
      category: 'Talleres'
    },
    {
      id: 2,
      image: banner2,
      category: 'Cursos'
    },
    {
      id: 3,
      image: banner3,
      category: 'Tecnología'
    }
  ]
}

function App() {
  const [currentFeedback, setCurrentFeedback] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMicroLoading, setIsMicroLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showWhatsAppLink, setShowWhatsAppLink] = useState(false);
  const [apiConfigurada, setApiConfigurada] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    nombre: '',
    telefono: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeedback((prev) => 
        prev === professionalInfo.feedbacks.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    // Verificar si la API está configurada
    setApiConfigurada(validarConfiguracionAPI());
    
    // Debug de Supabase Auth (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log('🔧 Modo desarrollo - Debug de Supabase Auth:');
      debugSupabaseAuth();
    }

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      // Formatear teléfono mientras se escribe
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para formatear número de teléfono
  const formatPhoneNumber = (phone: string) => {
    // Remover todo excepto números
    const numbers = phone.replace(/\D/g, '');
    
    // Limitar a 10 dígitos para Puerto Rico
    const limitedNumbers = numbers.slice(0, 10);
    
    // Formatear como (787) 123-4567
    if (limitedNumbers.length >= 6) {
      return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`;
    } else if (limitedNumbers.length >= 3) {
      return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3)}`;
    } else if (limitedNumbers.length > 0) {
      return `(${limitedNumbers}`;
    }
    
    return limitedNumbers;
  };

  const handleWhatsApp = (message?: string) => {
    const defaultMessage = `Hola, me gustaría obtener más información sobre sus servicios.`;
    const whatsappUrl = `https://wa.me/${professionalInfo.whatsapp}?text=${encodeURIComponent(message || defaultMessage)}`;
    
    // Detectar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    try {
      if (isMobile) {
        // En móvil, intentar abrir directamente en la app
        window.location.href = whatsappUrl;
      } else {
        // En desktop, usar window.open
        const newWindow = window.open(whatsappUrl, '_blank');
        
        // Si window.open falla (por bloqueador de popups), usar location.href como fallback
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = whatsappUrl;
        }
      }
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      // Fallback: siempre usar location.href si hay algún error
      window.location.href = whatsappUrl;
    }
  };

  // Función para validar número de teléfono
  const validatePhoneNumber = (phone: string) => {
    // Remover espacios, guiones y paréntesis
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Validar que solo contenga números
    if (!/^\d+$/.test(cleanPhone)) {
      return { isValid: false, message: 'El teléfono solo puede contener números' };
    }
    
    // Validar longitud (mínimo 7, máximo 15 dígitos)
    if (cleanPhone.length < 7) {
      return { isValid: false, message: 'El teléfono debe tener al menos 7 dígitos' };
    }
    
    if (cleanPhone.length > 15) {
      return { isValid: false, message: 'El teléfono no puede tener más de 15 dígitos' };
    }
    
    // Validar formato específico para Puerto Rico (opcional)
    // Puerto Rico: +1-787, +1-939, +1-856
    if (cleanPhone.startsWith('787') || cleanPhone.startsWith('939') || cleanPhone.startsWith('856')) {
      if (cleanPhone.length !== 10) {
        return { isValid: false, message: 'Número de Puerto Rico debe tener 10 dígitos' };
      }
    }
    
    return { isValid: true, message: '' };
  };

  const handleFormSubmit = async () => {
    // Verificar honeypot anti-spam
    const honeypotValue = (document.querySelector('input[name="website"]') as HTMLInputElement)?.value;
    if (honeypotValue && honeypotValue.trim() !== '') {
      console.log('🚫 Spam detectado, abortando envío');
      return; // Abortar silenciosamente
    }

    // Limpiar errores previos
    setValidationErrors({ nombre: '', telefono: '' });
    
    let hasErrors = false;
    const newErrors = { nombre: '', telefono: '' };

    // Validar nombre
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'Solo necesitamos tu nombre para continuar 🚀';
      hasErrors = true;
    }

    // Validar teléfono
    if (!formData.telefono) {
      newErrors.telefono = 'Necesitamos tu número para enviarte el mensaje 📲';
      hasErrors = true;
    } else {
      const phoneValidation = validatePhoneNumber(formData.telefono);
      if (!phoneValidation.isValid) {
        newErrors.telefono = phoneValidation.message;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setValidationErrors(newErrors);
      return;
    }

    // Activar micro-loading primero
    setIsMicroLoading(true);
    
    // Esperar 1 segundo para el micro-loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Activar loading principal
    setIsMicroLoading(false);
    setIsLoading(true);

    try {
      // Intentar enviar el lead a FacturaPro si está configurado
      if (apiConfigurada) {
        console.log('📤 Enviando lead a FacturaPro...');
        const result = await enviarLeadAFacturaPro({
          nombre: formData.nombre,
          telefono: formData.telefono
        });

        if (result.success) {
          console.log('✅ Lead registrado exitosamente en FacturaPro');
        } else {
          console.warn('⚠️ Error al registrar lead en FacturaPro:', result.message);
          // Continuar con WhatsApp aunque falle la API
        }
      } else {
        console.log('ℹ️ API no configurada, enviando solo a WhatsApp');
      }

      // Mostrar estado de guardado
      setIsLoading(false);
      setIsSaved(true);

      // Preparar mensaje para WhatsApp
      const message = `Hola! Me llamo ${formData.nombre.trim()}, mi teléfono es ${formData.telefono}. Me gustaría obtener más información sobre sus servicios.`;
      
      // Intentar abrir WhatsApp
      const whatsappUrl = `https://wa.me/${professionalInfo.whatsapp}?text=${encodeURIComponent(message)}`;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      let opened = false;
      try {
        if (isMobile) {
          window.location.href = whatsappUrl;
          opened = true;
        } else {
          const newWindow = window.open(whatsappUrl, '_blank');
          if (newWindow && !newWindow.closed) {
            opened = true;
          }
        }
      } catch (error) {
        console.error('Error al abrir WhatsApp:', error);
      }

      // Si no se abrió WhatsApp en 2 segundos, mostrar enlace
      if (!opened) {
        setTimeout(() => {
          setShowWhatsAppLink(true);
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Error en el proceso:', error);
      // Redirigir a WhatsApp aunque haya error
      const message = `Hola! Me llamo ${formData.nombre.trim()}, mi teléfono es ${formData.telefono}. Me gustaría obtener más información sobre sus servicios.`;
      handleWhatsApp(message);
    } finally {
      // Desactivar loading
      setIsLoading(false);
      setIsMicroLoading(false);
    }
  };

  return (
    <>
    {/*Tamaño sugerido de la imagen:
    430 x 200 px (o cualquier múltiplo, por ejemplo 860 x 400 px, 1290 x 600 px, etc.)*/}

      <div className="container">
        <div className="card">
          {/* Video Promocional - COMENTADO PARA OPTIMIZAR CONVERSIÓN */}
          {/* 
          <div className="feedback-section-top">
            <video
              className="banner-image"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={promoVideo} type="video/mp4" />
            </video>
          </div>
          */}

          {/* Feedback Slideshow */}
          <div className="feedback-section-top">
            <div className="feedback-slideshow">
              {professionalInfo.feedbacks.map((feedback, index) => (
                <div
                  key={feedback.id}
                  className={`feedback-slide ${index === currentFeedback ? 'active' : ''}`}
                >
                  <img src={feedback.image} alt={`Feedback ${feedback.id}`} className="banner-image" />
                  
                  {/* Etiqueta identificativa - Esquina superior derecha */}
                  {/* <div 
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'rgba(0, 0, 0, 0.85)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      zIndex: 1000,
                      opacity: index === currentFeedback ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      pointerEvents: 'none'
                    }}
                  >
                    <p
                      style={{
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {feedback.category || 'Testimonio'}
                    </p>
                  </div> */}
                </div>
              ))}
            </div>
          </div>

          {/* Card Header with Logo */}
          <div className="card-header">
            <div className="header-main">
              <div className="avatar">
                <img 
                  src={logoImage}
                  alt={professionalInfo.name}
                  className="avatar-image"
                />
              </div>
            </div>
            <div className="header-content">
              <h1 className="title">{professionalInfo.name}</h1>
              <h2 className="subtitle">{professionalInfo.title}</h2>
              <p className="description">{professionalInfo.description}</p>
              
              {/* Validación Social */}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(37, 211, 102, 0.1)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <span style={{
                  color: '#25D366',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  ⭐ Más de 300 personas ya se comunicaron por aquí.
                </span>
              </div>
            </div>
          </div>

          {/* Redes Sociales y Contacto - COMENTADO PARA OPTIMIZAR CONVERSIÓN */}
          {/* 
          <div className="social-section" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <a href="https://www.instagram.com/tuguiadigitalpr?igsh=bm01dnV6YjBjNm1m&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', borderRadius: '50%', width: 56, height: 56, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', overflow: 'hidden', transition: 'transform 0.2s' }}>
              <img src={IGLogo} alt="Instagram" style={{ width: 32, height: 32, objectFit: 'cover' }} />
            </a>
            <a href="https://www.facebook.com/share/19bPEYkBvX/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1877F2', borderRadius: '50%', width: 56, height: 56, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', overflow: 'hidden', transition: 'transform 0.2s' }}>
              <img src={FBLogo} alt="Facebook" style={{ width: 32, height: 32, objectFit: 'cover' }} />
            </a>
            <a href={professionalInfo.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', width: 56, height: 56, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', overflow: 'hidden', transition: 'transform 0.2s' }}>
              <svg width="28" height="28" fill="#fff" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </a>
            <a href={professionalInfo.location.maps} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)', borderRadius: '50%', width: 56, height: 56, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', overflow: 'hidden', transition: 'transform 0.2s' }}>
              <svg width="28" height="28" fill="#fff" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>
          </div>
          */}

          {/* Call-to-Action Principal */}
          <div style={{ 
            padding: '0 2rem 2rem 2rem',
            textAlign: 'center',
            display: showForm ? 'none' : 'block'
          }}>
            <button
              onClick={() => {
                setShowForm(true);
                // Scroll suave al formulario después de que se expanda
                setTimeout(() => {
                  const formElement = document.querySelector('.lead-form');
                  if (formElement) {
                    formElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    });
                  }
                }, 100);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '1.2rem 2rem',
                fontWeight: '600',
                fontSize: '1.2rem',
                boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '48px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.3)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
              </svg>
              📲 Habla ahora por WhatsApp
            </button>
          </div>

          {/* Formulario Inline Expandible */}
          {showForm && (
            <div className="lead-form" style={{ 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '20px', 
              padding: '2rem', 
              margin: '0 2rem 2rem 2rem',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <p style={{
                color: '#fff',
                fontSize: '1rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                opacity: 0.9
              }}>
                Escríbenos y hablamos por WhatsApp en segundos 🚀
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Tu Nombre & Apellido*"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFormSubmit();
                      }
                    }}
                    autoComplete="name"
                    autoFocus={showForm}
                    enterKeyHint="go"
                    required
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      borderRadius: '12px',
                      border: validationErrors.nombre ? '2px solid #ff6b6b' : '2px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '1.1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box',
                      minHeight: '48px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00B4DB'}
                    onBlur={(e) => e.target.style.borderColor = validationErrors.nombre ? '#ff6b6b' : 'rgba(255,255,255,0.2)'}
                  />
                  {validationErrors.nombre && (
                    <p style={{
                      color: '#ff6b6b',
                      fontSize: '0.9rem',
                      margin: '0.5rem 0 0 0',
                      textAlign: 'left'
                    }}>
                      {validationErrors.nombre}
                    </p>
                  )}
                </div>
                
                <div>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="(787) 123-4567 *"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFormSubmit();
                      }
                    }}
                    autoComplete="tel"
                    inputMode="tel"
                    enterKeyHint="go"
                    required
                    maxLength={14}
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      borderRadius: '12px',
                      border: validationErrors.telefono ? '2px solid #ff6b6b' : '2px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '1.1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box',
                      minHeight: '48px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00B4DB'}
                    onBlur={(e) => e.target.style.borderColor = validationErrors.telefono ? '#ff6b6b' : 'rgba(255,255,255,0.2)'}
                  />
                  {validationErrors.telefono && (
                    <p style={{
                      color: '#ff6b6b',
                      fontSize: '0.9rem',
                      margin: '0.5rem 0 0 0',
                      textAlign: 'left'
                    }}>
                      {validationErrors.telefono}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleFormSubmit}
                disabled={isLoading || isMicroLoading || isSaved}
                style={{
                  width: '100%',
                  background: (isLoading || isMicroLoading || isSaved)
                    ? 'linear-gradient(135deg, #666 0%, #555 100%)' 
                    : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  marginTop: '1.5rem',
                  boxShadow: (isLoading || isMicroLoading || isSaved)
                    ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
                    : '0 4px 16px rgba(37, 211, 102, 0.3)',
                  cursor: (isLoading || isMicroLoading || isSaved) ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: (isLoading || isMicroLoading || isSaved) ? 0.7 : 1,
                  minHeight: '48px'
                }}
                onMouseOver={(e) => {
                  if (!isLoading && !isMicroLoading && !isSaved) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading && !isMicroLoading && !isSaved) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.3)';
                  }
                }}
              >
                {isMicroLoading ? (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    Conectando con WhatsApp…
                  </>
                ) : isLoading ? (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    Procesando...
                  </>
                ) : isSaved ? (
                  <>
                    Guardado ✅ Abriendo WhatsApp…
                  </>
                ) : (
                  <>
                    ✅ Hablar AHORA por WhatsApp 🚀
                  </>
                )}
              </button>
              
              {/* Aviso discreto de WhatsApp */}
              {showWhatsAppLink && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(37, 211, 102, 0.1)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  borderRadius: '8px'
                }}>
                  <p style={{
                    color: '#25D366',
                    fontSize: '0.9rem',
                    margin: '0 0 0.5rem 0',
                    fontWeight: '500'
                  }}>
                    ¿No se abrió WhatsApp?
                  </p>
                  <a 
                    href={`https://wa.me/${professionalInfo.whatsapp}?text=${encodeURIComponent(`Hola! Me llamo ${formData.nombre.trim()}, mi teléfono es ${formData.telefono}. Me gustaría obtener más información sobre sus servicios.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#25D366',
                      textDecoration: 'underline',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    Abrir chat aquí
                  </a>
                </div>
              )}

              <div style={{
                textAlign: 'center',
                marginTop: '1rem',
                lineHeight: '1.4'
              }}>
                <p style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem',
                  margin: '0 0 0.5rem 0'
                }}>
                  Tu información está segura y solo se usará para contactarte.
                </p>
                <p style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.8rem',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  🔒 Nunca compartimos tu información con terceros.
                </p>
              </div>

              {/* Honeypot anti-spam */}
              <input
                type="text"
                name="website"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default App
