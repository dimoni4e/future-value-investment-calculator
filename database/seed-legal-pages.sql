-- Additional Legal Pages for Database
-- This script adds legal pages (privacy, terms, cookies) to the database in all locales

-- English legal pages
INSERT INTO pages (slug, locale, title, content, meta_description, published) VALUES
('privacy', 'en', 'Privacy Policy - Future Value Investment Calculator', 
 '<h1>Privacy Policy</h1>
 <h2>Introduction</h2>
 <p>Welcome to Future Value Investment Calculator. We respect your privacy and are committed to protecting your personal data.</p>
 <h2>Information We Collect</h2>
 <p>We collect information to provide better services to our users, including:</p>
 <ul>
   <li>Browser and device information for analytics</li>
   <li>Usage data to improve our calculator</li>
   <li>Investment parameters you enter (stored locally only)</li>
 </ul>
 <h2>How We Use Your Information</h2>
 <p>We use this information to:</p>
 <ul>
   <li>Provide and improve our financial planning tools</li>
   <li>Analyze usage patterns to enhance user experience</li>
   <li>Ensure security and prevent fraud</li>
 </ul>
 <p>For complete privacy details, please refer to our static privacy policy.</p>',
 'Learn how Future Value Investment Calculator protects your privacy and handles your data.',
 true),

('terms', 'en', 'Terms of Service - Future Value Investment Calculator',
 '<h1>Terms of Service</h1>
 <h2>Acceptance of Terms</h2>
 <p>By using the Future Value Investment Calculator, you agree to these terms of service.</p>
 <h2>Use of Service</h2>
 <p>Our calculator is provided for educational and planning purposes only. All calculations are estimates.</p>
 <h2>Disclaimers</h2>
 <p>Investment results may vary. Past performance does not guarantee future results. Please consult with a financial advisor for personalized advice.</p>
 <h2>Liability</h2>
 <p>We are not liable for any investment decisions made based on our calculator results.</p>',
 'Terms of service for using the Future Value Investment Calculator.',
 true),

('cookies', 'en', 'Cookie Policy - Future Value Investment Calculator',
 '<h1>Cookie Policy</h1>
 <h2>What Are Cookies</h2>
 <p>Cookies are small text files stored on your device to enhance your browsing experience.</p>
 <h2>How We Use Cookies</h2>
 <p>We use cookies for:</p>
 <ul>
   <li>Remembering your preferences (currency, language)</li>
   <li>Analytics to improve our service</li>
   <li>Security and fraud prevention</li>
 </ul>
 <h2>Managing Cookies</h2>
 <p>You can control cookies through your browser settings. Disabling cookies may affect functionality.</p>',
 'Information about how Future Value Investment Calculator uses cookies.',
 true);

-- Spanish legal pages  
INSERT INTO pages (slug, locale, title, content, meta_description, published) VALUES
('privacy', 'es', 'Política de Privacidad - Calculadora de Valor Futuro de Inversión',
 '<h1>Política de Privacidad</h1>
 <h2>Introducción</h2>
 <p>Bienvenido a la Calculadora de Valor Futuro de Inversión. Respetamos tu privacidad y nos comprometemos a proteger tus datos personales.</p>
 <h2>Información que Recopilamos</h2>
 <p>Recopilamos información para proporcionar mejores servicios, incluyendo:</p>
 <ul>
   <li>Información del navegador y dispositivo para análisis</li>
   <li>Datos de uso para mejorar nuestra calculadora</li>
   <li>Parámetros de inversión que ingresas (almacenados solo localmente)</li>
 </ul>
 <h2>Cómo Usamos tu Información</h2>
 <p>Usamos esta información para:</p>
 <ul>
   <li>Proporcionar y mejorar nuestras herramientas de planificación financiera</li>
   <li>Analizar patrones de uso para mejorar la experiencia del usuario</li>
   <li>Garantizar la seguridad y prevenir fraudes</li>
 </ul>',
 'Aprende cómo la Calculadora de Valor Futuro de Inversión protege tu privacidad.',
 true),

('terms', 'es', 'Términos de Servicio - Calculadora de Valor Futuro de Inversión',
 '<h1>Términos de Servicio</h1>
 <h2>Aceptación de Términos</h2>
 <p>Al usar la Calculadora de Valor Futuro de Inversión, aceptas estos términos de servicio.</p>
 <h2>Uso del Servicio</h2>
 <p>Nuestra calculadora se proporciona solo con fines educativos y de planificación. Todos los cálculos son estimaciones.</p>
 <h2>Descargos de Responsabilidad</h2>
 <p>Los resultados de inversión pueden variar. El rendimiento pasado no garantiza resultados futuros.</p>',
 'Términos de servicio para usar la Calculadora de Valor Futuro de Inversión.',
 true),

('cookies', 'es', 'Política de Cookies - Calculadora de Valor Futuro de Inversión',
 '<h1>Política de Cookies</h1>
 <h2>Qué son las Cookies</h2>
 <p>Las cookies son pequeños archivos de texto almacenados en tu dispositivo para mejorar tu experiencia de navegación.</p>
 <h2>Cómo Usamos las Cookies</h2>
 <p>Usamos cookies para:</p>
 <ul>
   <li>Recordar tus preferencias (moneda, idioma)</li>
   <li>Análisis para mejorar nuestro servicio</li>
   <li>Seguridad y prevención de fraudes</li>
 </ul>',
 'Información sobre cómo usa cookies la Calculadora de Valor Futuro de Inversión.',
 true);

-- Polish legal pages
INSERT INTO pages (slug, locale, title, content, meta_description, published) VALUES
('privacy', 'pl', 'Polityka Prywatności - Kalkulator Wartości Przyszłej Inwestycji',
 '<h1>Polityka Prywatności</h1>
 <h2>Wprowadzenie</h2>
 <p>Witamy w Kalkulatorze Wartości Przyszłej Inwestycji. Szanujemy Twoją prywatność i zobowiązujemy się do ochrony Twoich danych osobowych.</p>
 <h2>Informacje, które Zbieramy</h2>
 <p>Zbieramy informacje, aby zapewnić lepsze usługi, w tym:</p>
 <ul>
   <li>Informacje o przeglądarce i urządzeniu do analiz</li>
   <li>Dane użytkowania w celu usprawnienia naszego kalkulatora</li>
   <li>Parametry inwestycyjne, które wprowadzasz (przechowywane tylko lokalnie)</li>
 </ul>
 <h2>Jak Używamy Twoich Informacji</h2>
 <p>Używamy tych informacji do:</p>
 <ul>
   <li>Dostarczania i ulepszania naszych narzędzi planowania finansowego</li>
   <li>Analizowania wzorców użytkowania w celu poprawy doświadczenia użytkownika</li>
   <li>Zapewnienia bezpieczeństwa i zapobiegania oszustwom</li>
 </ul>',
 'Dowiedz się, jak Kalkulator Wartości Przyszłej Inwestycji chroni Twoją prywatność.',
 true),

('terms', 'pl', 'Warunki Korzystania - Kalkulator Wartości Przyszłej Inwestycji',
 '<h1>Warunki Korzystania</h1>
 <h2>Akceptacja Warunków</h2>
 <p>Korzystając z Kalkulatora Wartości Przyszłej Inwestycji, zgadzasz się na te warunki korzystania.</p>
 <h2>Korzystanie z Usługi</h2>
 <p>Nasz kalkulator jest dostarczany wyłącznie w celach edukacyjnych i planistycznych. Wszystkie obliczenia to szacunki.</p>
 <h2>Zastrzeżenia</h2>
 <p>Wyniki inwestycji mogą się różnić. Wyniki z przeszłości nie gwarantują przyszłych rezultatów.</p>',
 'Warunki korzystania z Kalkulatora Wartości Przyszłej Inwestycji.',
 true),

('cookies', 'pl', 'Polityka Cookies - Kalkulator Wartości Przyszłej Inwestycji',
 '<h1>Polityka Cookies</h1>
 <h2>Czym są Cookies</h2>
 <p>Cookies to małe pliki tekstowe przechowywane na Twoim urządzeniu w celu poprawy doświadczenia przeglądania.</p>
 <h2>Jak Używamy Cookies</h2>
 <p>Używamy cookies do:</p>
 <ul>
   <li>Zapamiętywania Twoich preferencji (waluta, język)</li>
   <li>Analiz w celu poprawy naszej usługi</li>
   <li>Bezpieczeństwa i zapobiegania oszustwom</li>
 </ul>',
 'Informacje o tym, jak Kalkulator Wartości Przyszłej Inwestycji używa cookies.',
 true);
