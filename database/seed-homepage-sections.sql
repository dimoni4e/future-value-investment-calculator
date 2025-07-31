-- Missing homepage section translations for scenarios and content sections  
-- This script adds translations for the sections that are currently hardcoded in English

-- Clear existing entries to avoid duplicates
DELETE FROM home_content WHERE section IN ('scenarios', 'education', 'comparison', 'cta');

-- SCENARIOS SECTION TRANSLATIONS

-- English
INSERT INTO home_content (locale, section, key, value) VALUES
-- Expert-Curated Investment Plans section
('en', 'scenarios', 'expert_title', 'Expert-Curated Investment Plans'),
('en', 'scenarios', 'expert_subtitle', 'Explore proven investment strategies tailored for different financial goals and time horizons'),
('en', 'scenarios', 'view_all_scenarios', 'View All Scenarios'),

-- Latest Investment Scenarios section
('en', 'scenarios', 'latest_title', 'Latest Investment Scenarios'),
('en', 'scenarios', 'latest_subtitle', 'Discover investment plans recently created by our community'),
('en', 'scenarios', 'recently_created', 'Recently Created'),
('en', 'scenarios', 'user_created', 'User Created'),
('en', 'scenarios', 'initial', 'Initial'),
('en', 'scenarios', 'monthly', 'Monthly'),
('en', 'scenarios', 'return', 'Return'),
('en', 'scenarios', 'timeline', 'Timeline'),

-- RecentScenarios component
('en', 'scenarios', 'popular_title', 'Popular Investment Scenarios'),
('en', 'scenarios', 'explore_all', 'Explore all scenarios →'),
('en', 'scenarios', 'no_scenarios', 'No user scenarios yet'),
('en', 'scenarios', 'create_first', 'Create the first scenario'),
('en', 'scenarios', 'views', 'views');

-- Spanish (es)
INSERT INTO home_content (locale, section, key, value) VALUES
-- Expert-Curated Investment Plans section
('es', 'scenarios', 'expert_title', 'Planes de Inversión Seleccionados por Expertos'),
('es', 'scenarios', 'expert_subtitle', 'Explora estrategias de inversión probadas adaptadas para diferentes objetivos financieros y horizontes temporales'),
('es', 'scenarios', 'view_all_scenarios', 'Ver Todos los Escenarios'),

-- Latest Investment Scenarios section
('es', 'scenarios', 'latest_title', 'Últimos Escenarios de Inversión'),
('es', 'scenarios', 'latest_subtitle', 'Descubre planes de inversión creados recientemente por nuestra comunidad'),
('es', 'scenarios', 'recently_created', 'Creado Recientemente'),
('es', 'scenarios', 'user_created', 'Creado por Usuario'),
('es', 'scenarios', 'initial', 'Inicial'),
('es', 'scenarios', 'monthly', 'Mensual'),
('es', 'scenarios', 'return', 'Retorno'),
('es', 'scenarios', 'timeline', 'Cronograma'),

-- RecentScenarios component
('es', 'scenarios', 'popular_title', 'Escenarios de Inversión Populares'),
('es', 'scenarios', 'explore_all', 'Explorar todos los escenarios →'),
('es', 'scenarios', 'no_scenarios', 'Aún no hay escenarios de usuario'),
('es', 'scenarios', 'create_first', 'Crear el primer escenario'),
('es', 'scenarios', 'views', 'vistas');

-- Polish (pl)
INSERT INTO home_content (locale, section, key, value) VALUES
-- Expert-Curated Investment Plans section
('pl', 'scenarios', 'expert_title', 'Plany Inwestycyjne Wybrane przez Ekspertów'),
('pl', 'scenarios', 'expert_subtitle', 'Poznaj sprawdzone strategie inwestycyjne dostosowane do różnych celów finansowych i horyzontów czasowych'),
('pl', 'scenarios', 'view_all_scenarios', 'Zobacz Wszystkie Scenariusze'),

-- Latest Investment Scenarios section
('pl', 'scenarios', 'latest_title', 'Najnowsze Scenariusze Inwestycyjne'),
('pl', 'scenarios', 'latest_subtitle', 'Odkryj plany inwestycyjne ostatnio stworzone przez naszą społeczność'),
('pl', 'scenarios', 'recently_created', 'Niedawno Utworzone'),
('pl', 'scenarios', 'user_created', 'Utworzone przez Użytkownika'),
('pl', 'scenarios', 'initial', 'Początkowe'),
('pl', 'scenarios', 'monthly', 'Miesięczne'),
('pl', 'scenarios', 'return', 'Zwrot'),
('pl', 'scenarios', 'timeline', 'Harmonogram'),

-- RecentScenarios component
('pl', 'scenarios', 'popular_title', 'Popularne Scenariusze Inwestycyjne'),
('pl', 'scenarios', 'explore_all', 'Odkryj wszystkie scenariusze →'),
('pl', 'scenarios', 'no_scenarios', 'Jeszcze brak scenariuszy użytkowników'),
('pl', 'scenarios', 'create_first', 'Utwórz pierwszy scenariusz'),
('pl', 'scenarios', 'views', 'wyświetleń');

-- ADDITIONAL CONTENT SECTIONS

-- Understanding Investment Growth (these should be added to SEOContentSection)
INSERT INTO home_content (locale, section, key, value) VALUES
('en', 'education', 'title', 'Understanding Investment Growth'),
('en', 'education', 'subtitle', 'Learn the fundamentals of compound interest and long-term wealth building'),

('es', 'education', 'title', 'Entendiendo el Crecimiento de Inversiones'),
('es', 'education', 'subtitle', 'Aprende los fundamentos del interés compuesto y la construcción de riqueza a largo plazo'),

('pl', 'education', 'title', 'Zrozumienie Wzrostu Inwestycji'),
('pl', 'education', 'subtitle', 'Poznaj podstawy odsetek składanych i długoterminowego budowania bogactwa');

-- Investment Strategy Comparison
INSERT INTO home_content (locale, section, key, value) VALUES
('en', 'comparison', 'title', 'Investment Strategy Comparison'),
('en', 'comparison', 'subtitle', 'Compare different investment approaches and their potential outcomes'),
('en', 'comparison', 'risk_reward', '📊 Risk vs. Reward'),
('en', 'comparison', 'time_horizon', '⏰ Time Horizon Matters'),
('en', 'comparison', 'diversification', '🎯 Diversification Benefits'),

('es', 'comparison', 'title', 'Comparación de Estrategias de Inversión'),
('es', 'comparison', 'subtitle', 'Compara diferentes enfoques de inversión y sus resultados potenciales'),
('es', 'comparison', 'risk_reward', '📊 Riesgo vs. Recompensa'),
('es', 'comparison', 'time_horizon', '⏰ El Horizonte Temporal Importa'),
('es', 'comparison', 'diversification', '🎯 Beneficios de la Diversificación'),

('pl', 'comparison', 'title', 'Porównanie Strategii Inwestycyjnych'),
('pl', 'comparison', 'subtitle', 'Porównaj różne podejścia inwestycyjne i ich potencjalne wyniki'),
('pl', 'comparison', 'risk_reward', '📊 Ryzyko vs. Nagroda'),
('pl', 'comparison', 'time_horizon', '⏰ Horyzont Czasowy Ma Znaczenie'),
('pl', 'comparison', 'diversification', '🎯 Korzyści z Dywersyfikacji');

-- Ready to Calculate section
INSERT INTO home_content (locale, section, key, value) VALUES
('en', 'cta', 'title', 'Ready to Calculate Your Investment Growth?'),
('en', 'cta', 'subtitle', 'Start planning your financial future with our advanced investment calculator'),
('en', 'cta', 'button', 'Start Calculating Now'),

('es', 'cta', 'title', '¿Listo para Calcular el Crecimiento de tu Inversión?'),
('es', 'cta', 'subtitle', 'Comienza a planificar tu futuro financiero con nuestra calculadora de inversiones avanzada'),
('es', 'cta', 'button', 'Comenzar a Calcular Ahora'),

('pl', 'cta', 'title', 'Gotowy na Obliczenie Wzrostu Swojej Inwestycji?'),
('pl', 'cta', 'subtitle', 'Zacznij planować swoją przyszłość finansową dzięki naszemu zaawansowanemu kalkulatorowi inwestycji'),
('pl', 'cta', 'button', 'Zacznij Obliczać Teraz');
