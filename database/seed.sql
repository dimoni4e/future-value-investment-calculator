-- Seed data for Future Value Investment Calculator
-- Insert existing content from i18n files into database

-- ============================================================================
-- HOME CONTENT - ENGLISH
-- ============================================================================

-- Layout content
INSERT INTO home_content (locale, section, key, value) VALUES
('en', 'layout', 'title', 'Financial Growth Planner'),
('en', 'layout', 'description', 'Plan Your Financial Future');

-- Navigation content
INSERT INTO home_content (locale, section, key, value) VALUES
('en', 'navigation', 'home', 'Home'),
('en', 'navigation', 'about', 'About'),
('en', 'navigation', 'contact', 'Contact'),
('en', 'navigation', 'getStarted', 'Get Started');

-- Hero section content
INSERT INTO home_content (locale, section, key, value) VALUES
('en', 'hero', 'badge', 'Professional Investment Planning'),
('en', 'hero', 'subtitle', 'Make informed investment decisions with our advanced compound interest calculator. Visualize growth scenarios, compare strategies, and build confidence in your financial journey.'),
('en', 'hero', 'startCalculating', 'Start Calculating'),
('en', 'hero', 'watchDemo', 'Watch Demo'),
('en', 'hero', 'compoundInterest', 'Compound Interest'),
('en', 'hero', 'interactiveCharts', 'Interactive Charts'),
('en', 'hero', 'scenarioPlanning', 'Scenario Planning'),
('en', 'hero', 'exportResults', 'Export Results');

-- Features section content
INSERT INTO home_content (locale, section, key, value) VALUES
('en', 'features', 'title', 'Your Complete Financial Planning Suite'),
('en', 'features', 'subtitle', 'Advanced tools and analytics to help you make informed investment decisions with confidence'),
('en', 'features', 'advancedCalculator', 'Advanced Calculator'),
('en', 'features', 'advancedCalculatorDesc', 'Precise compound interest calculations with customizable parameters for any investment scenario'),
('en', 'features', 'visualAnalytics', 'Visual Analytics'),
('en', 'features', 'visualAnalyticsDesc', 'Interactive charts and graphs that bring your investment projections to life'),
('en', 'features', 'goalPlanning', 'Goal Planning'),
('en', 'features', 'goalPlanningDesc', 'Set financial targets and see exactly what it takes to achieve your investment goals');

-- ============================================================================
-- PREDEFINED SCENARIOS - ENGLISH
-- ============================================================================

INSERT INTO scenarios (slug, locale, name, description, initial_amount, monthly_contribution, annual_return, time_horizon, tags, is_predefined, is_public, created_by) VALUES
('starter-10k-500-7-10', 'en', 'Beginner Investor', 'Conservative start with moderate monthly contributions', 10000.00, 500.00, 7.00, 10, ARRAY['beginner', 'conservative', 'starter'], true, true, 'system'),
('retirement-50k-2k-6-30', 'en', 'Retirement Planning', 'Long-term retirement strategy with steady contributions', 50000.00, 2000.00, 6.00, 30, ARRAY['retirement', 'long-term', 'conservative'], true, true, 'system'),
('aggressive-25k-1k-12-20', 'en', 'Growth Investor', 'Higher risk, higher reward investment strategy', 25000.00, 1000.00, 12.00, 20, ARRAY['aggressive', 'growth', 'high-risk'], true, true, 'system'),
('young-5k-300-8-15', 'en', 'Young Professional', 'Starting early with modest contributions', 5000.00, 300.00, 8.00, 15, ARRAY['young', 'early-start', 'moderate'], true, true, 'system'),
('wealth-100k-5k-10-25', 'en', 'Wealth Building', 'High-value investments for serious wealth accumulation', 100000.00, 5000.00, 10.00, 25, ARRAY['wealth', 'high-value', 'aggressive'], true, true, 'system'),
('emergency-1k-200-4-5', 'en', 'Emergency Fund', 'Building a safety net with conservative returns', 1000.00, 200.00, 4.00, 5, ARRAY['emergency', 'safety', 'conservative'], true, true, 'system'),
('house-5k-1500-5-7', 'en', 'Down Payment Savings', 'Saving for a house with conservative returns', 5000.00, 1500.00, 5.00, 7, ARRAY['house', 'down-payment', 'savings', 'conservative'], true, true, 'system');

-- ============================================================================
-- PREDEFINED SCENARIOS - POLISH
-- ============================================================================

INSERT INTO scenarios (slug, locale, name, description, initial_amount, monthly_contribution, annual_return, time_horizon, tags, is_predefined, is_public, created_by) VALUES
('starter-10k-500-7-10', 'pl', 'Inwestor Początkujący', 'Konserwatywny start z umiarkowanymi miesięcznymi wpłatami', 10000.00, 500.00, 7.00, 10, ARRAY['początkujący', 'konserwatywny', 'starter'], true, true, 'system'),
('retirement-50k-2k-6-30', 'pl', 'Planowanie Emerytury', 'Długoterminowa strategia emerytalna ze stałymi wpłatami', 50000.00, 2000.00, 6.00, 30, ARRAY['emerytura', 'długoterminowy', 'konserwatywny'], true, true, 'system'),
('aggressive-25k-1k-12-20', 'pl', 'Inwestor Wzrostowy', 'Strategia inwestycyjna wysokiego ryzyka i wysokiej nagrody', 25000.00, 1000.00, 12.00, 20, ARRAY['agresywny', 'wzrost', 'wysokie-ryzyko'], true, true, 'system'),
('young-5k-300-8-15', 'pl', 'Młody Profesjonalista', 'Wczesny start z umiarkowanymi wpłatami', 5000.00, 300.00, 8.00, 15, ARRAY['młody', 'wczesny-start', 'umiarkowany'], true, true, 'system'),
('wealth-100k-5k-10-25', 'pl', 'Budowanie Bogactwa', 'Agresywna strategia akumulacji majątku wysokiej wartości', 100000.00, 5000.00, 10.00, 25, ARRAY['bogactwo', 'wysoka-wartość', 'agresywny'], true, true, 'system'),
('emergency-1k-200-4-5', 'pl', 'Fundusz Awaryjny', 'Budowanie siatki bezpieczeństwa z konserwatywnym zwrotem', 1000.00, 200.00, 4.00, 5, ARRAY['awaryjny', 'bezpieczeństwo', 'konserwatywny'], true, true, 'system'),
('house-5k-1500-5-7', 'pl', 'Wkład Własny na Dom', 'Oszczędzanie na dom z konserwatywnym zwrotem', 5000.00, 1500.00, 5.00, 7, ARRAY['dom', 'wkład-własny', 'oszczędności', 'konserwatywny'], true, true, 'system');

-- ============================================================================
-- PREDEFINED SCENARIOS - SPANISH
-- ============================================================================

INSERT INTO scenarios (slug, locale, name, description, initial_amount, monthly_contribution, annual_return, time_horizon, tags, is_predefined, is_public, created_by) VALUES
('starter-10k-500-7-10', 'es', 'Inversor Principiante', 'Comienzo conservador con contribuciones mensuales moderadas', 10000.00, 500.00, 7.00, 10, ARRAY['principiante', 'conservador', 'inicial'], true, true, 'system'),
('retirement-50k-2k-6-30', 'es', 'Planificación de Jubilación', 'Estrategia de jubilación a largo plazo con contribuciones constantes', 50000.00, 2000.00, 6.00, 30, ARRAY['jubilación', 'largo-plazo', 'conservador'], true, true, 'system'),
('aggressive-25k-1k-12-20', 'es', 'Inversor de Crecimiento', 'Estrategia de inversión de alto riesgo y alta recompensa', 25000.00, 1000.00, 12.00, 20, ARRAY['agresivo', 'crecimiento', 'alto-riesgo'], true, true, 'system'),
('young-5k-300-8-15', 'es', 'Joven Profesional', 'Comenzar temprano con contribuciones modestas', 5000.00, 300.00, 8.00, 15, ARRAY['joven', 'inicio-temprano', 'moderado'], true, true, 'system'),
('wealth-100k-5k-10-25', 'es', 'Construcción de Riqueza', 'Inversiones de alto valor para acumulación seria de riqueza', 100000.00, 5000.00, 10.00, 25, ARRAY['riqueza', 'alto-valor', 'agresivo'], true, true, 'system'),
('emergency-1k-200-4-5', 'es', 'Fondo de Emergencia', 'Construyendo una red de seguridad con rendimientos conservadores', 1000.00, 200.00, 4.00, 5, ARRAY['emergencia', 'seguridad', 'conservador'], true, true, 'system'),
('house-5k-1500-5-7', 'es', 'Ahorro para Entrada de Casa', 'Ahorrando para una casa con rendimientos conservadores', 5000.00, 1500.00, 5.00, 7, ARRAY['casa', 'entrada', 'ahorros', 'conservador'], true, true, 'system');

-- ============================================================================
-- STATIC PAGES - ABOUT PAGE
-- ============================================================================

INSERT INTO pages (slug, locale, title, content, meta_description, published) VALUES
('about', 'en', 'About - Future Value Investment Calculator', 
'<h1>About Our Mission</h1>
<p>We are dedicated to democratizing financial planning by providing accurate, accessible, and transparent investment calculation tools for everyone.</p>
<h2>Our Mission</h2>
<p>Financial planning shouldn''t be a privilege reserved for the wealthy. We believe everyone deserves access to powerful, accurate tools that help understand their investment potential and plan their financial future.</p>',
'Learn about our mission to democratize financial planning through accurate, accessible investment calculation tools.',
true),

('about', 'pl', 'O Nas - Kalkulator Wartości Przyszłej Inwestycji', 
'<h1>O Naszej Misji</h1>
<p>Jesteśmy dedykowani demokratyzacji planowania finansowego poprzez dostarczanie dokładnych, dostępnych i przejrzystych narzędzi kalkulacji inwestycji dla wszystkich.</p>
<h2>Nasza Misja</h2>
<p>Planowanie finansowe nie powinno być przywilejem zarezerwowanym dla bogatych. Wierzymy, że każdy zasługuje na dostęp do potężnych, dokładnych narzędzi, które pomagają zrozumieć potencjał swoich inwestycji i planować swoją finansową przyszłość.</p>',
'Poznaj naszą misję demokratyzacji planowania finansowego za pomocą dokładnych, dostępnych narzędzi kalkulacji inwestycji.',
true),

('about', 'es', 'Acerca de - Calculadora de Valor Futuro de Inversión', 
'<h1>Acerca de Nuestra Misión</h1>
<p>Estamos dedicados a democratizar la planificación financiera proporcionando herramientas de cálculo de inversiones precisas, accesibles y transparentes para todos.</p>
<h2>Nuestra Misión</h2>
<p>La planificación financiera no debería ser un privilegio reservado para los ricos. Creemos que todos merecen acceso a herramientas poderosas y precisas que ayuden a entender su potencial de inversión y planificar su futuro financiero.</p>',
'Conoce nuestra misión de democratizar la planificación financiera a través de herramientas de cálculo de inversiones precisas y accesibles.',
true);

-- ============================================================================
-- STATIC PAGES - CONTACT PAGE
-- ============================================================================

INSERT INTO pages (slug, locale, title, content, meta_description, published) VALUES
('contact', 'en', 'Contact Us - Future Value Investment Calculator', 
'<h1>Contact Us</h1>
<p>Have questions, suggestions, or feedback? We''d love to hear from you.</p>
<h2>Get in Touch</h2>
<p>Email us at: <a href="mailto:contact@nature2pixel.com">contact@nature2pixel.com</a></p>
<p>Please read our <a href="/privacy">privacy policy</a> to understand how we handle your information.</p>',
'Contact us for questions, suggestions, or feedback about our financial planning tools.',
true),

('contact', 'pl', 'Skontaktuj się z Nami - Kalkulator Wartości Przyszłej Inwestycji', 
'<h1>Skontaktuj się z Nami</h1>
<p>Masz pytania, sugestie lub opinie? Chcielibyśmy o Tobie usłyszeć.</p>
<h2>Skontaktuj się</h2>
<p>Wyślij nam e-mail: <a href="mailto:contact@nature2pixel.com">contact@nature2pixel.com</a></p>
<p>Przeczytaj naszą <a href="/privacy">politykę prywatności</a>, aby zrozumieć, jak obsługujemy Twoje informacje.</p>',
'Skontaktuj się z nami w sprawie pytań, sugestii lub opinii o naszych narzędziach planowania finansowego.',
true),

('contact', 'es', 'Contáctanos - Calculadora de Valor Futuro de Inversión', 
'<h1>Contáctanos</h1>
<p>¿Tienes preguntas, sugerencias o comentarios? Nos encantaría saber de ti.</p>
<h2>Ponte en Contacto</h2>
<p>Envíanos un email: <a href="mailto:contact@nature2pixel.com">contact@nature2pixel.com</a></p>
<p>Por favor lee nuestra <a href="/privacy">política de privacidad</a> para entender cómo manejamos tu información.</p>',
'Contáctanos para preguntas, sugerencias o comentarios sobre nuestras herramientas de planificación financiera.',
true);
