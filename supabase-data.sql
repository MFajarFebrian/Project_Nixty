-- Sample data for Supabase PostgreSQL

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Microsoft Office', 'microsoft-office', 'Microsoft Office Professional Plus suite with Word, Excel, PowerPoint, and more'),
('Microsoft Project', 'microsoft-project', 'Microsoft Project Professional for project management and planning'),
('Microsoft Visio', 'microsoft-visio', 'Microsoft Visio Professional for diagramming and flowcharts');

-- Insert products
INSERT INTO products (name, version, description, short_description, price, currency, category_id, image_url, is_new, is_featured, is_trending, status) VALUES
('Microsoft Office Pro Plus', '2016', 'Microsoft Office Professional Plus 2016 includes Word, Excel, PowerPoint, Outlook, OneNote, Access, and Publisher. Perfect for professional productivity.', 'Complete Office suite with all essential apps', 40000.00, 'IDR', 1, '/api/products/office-2016/image', FALSE, FALSE, FALSE, 'active'),
('Microsoft Office Pro Plus', '2019', 'Microsoft Office Professional Plus 2019 with enhanced features and improved performance. Includes all core Office applications with latest updates.', 'Enhanced Office suite with 2019 features', 40000.00, 'IDR', 1, '/api/products/office-2019/image', FALSE, FALSE, FALSE, 'active'),
('Microsoft Office Pro Plus', '2021', 'Microsoft Office Professional Plus 2021 - the latest version with new collaboration features, improved performance, and modern design.', 'Latest Office suite with cutting-edge features', 120000.00, 'IDR', 1, '/api/products/office-2021/image', TRUE, TRUE, TRUE, 'active'),
('Microsoft Office Pro Plus', '365', 'Microsoft Office 365 Professional Plus with cloud integration, regular updates, and 1TB OneDrive storage. Always up-to-date productivity suite.', 'Cloud-based Office with regular updates', 50000.00, 'IDR', 1, '/api/products/office-365/image', TRUE, TRUE, TRUE, 'active'),
('Microsoft Project Pro', '2016', 'Microsoft Project Professional 2016 for comprehensive project management. Plan, track, and manage projects with powerful tools and reporting.', 'Professional project management solution', 30000.00, 'IDR', 2, '/api/products/project-2016/image', FALSE, FALSE, FALSE, 'active'),
('Microsoft Project Pro', '2019', 'Microsoft Project Professional 2019 with enhanced project planning capabilities, improved collaboration, and better resource management.', 'Advanced project management with 2019 features', 35000.00, 'IDR', 2, '/api/products/project-2019/image', FALSE, FALSE, FALSE, 'active'),
('Microsoft Project Pro', '2021', 'Microsoft Project Professional 2021 - the latest project management solution with modern interface and enhanced collaboration features.', 'Latest project management with modern tools', 40000.00, 'IDR', 2, '/api/products/project-2021/image', TRUE, FALSE, TRUE, 'active'),
('Microsoft Visio Pro', '2016', 'Microsoft Visio Professional 2016 for creating professional diagrams, flowcharts, and organizational charts with extensive templates.', 'Professional diagramming and flowchart tool', 30000.00, 'IDR', 3, '/api/products/visio-2016/image', FALSE, FALSE, FALSE, 'active'),
('Microsoft Visio Pro', '2019', 'Microsoft Visio Professional 2019 with improved diagramming tools, enhanced collaboration, and new templates for modern workflows.', 'Enhanced diagramming with 2019 features', 35000.00, 'IDR', 3, '/api/products/visio-2019/image', FALSE, FALSE, FALSE, 'active'),
('Microsoft Visio Pro', '2021', 'Microsoft Visio Professional 2021 - the latest diagramming solution with modern templates, improved performance, and better integration.', 'Latest diagramming tool with modern features', 40000.00, 'IDR', 3, '/api/products/visio-2021/image', TRUE, FALSE, TRUE, 'active');

-- Insert announcements
INSERT INTO announcements (title, content, image_url, is_new, status) VALUES
('Microsoft Office 2021 Now Available', 'Microsoft Office Professional Plus 2021 is now available with new features, improved performance, and modern design. Get the latest productivity suite today!', '/api/announcements/1/image', TRUE, 'active'),
('Special Pricing for Microsoft Products', 'Get authentic Microsoft software at competitive prices. All products come with genuine licenses and full support.', '/api/announcements/2/image', TRUE, 'active'),
('Microsoft Project & Visio Professional', 'Professional project management and diagramming tools now available. Perfect for businesses and professionals who need advanced planning capabilities.', '/api/announcements/3/image', TRUE, 'active'),
('Office 365 Subscription Benefits', 'Subscribe to Office 365 and get regular updates, cloud storage, and always up-to-date features. Best value for continuous productivity.', '/api/announcements/4/image', TRUE, 'active'),
('Genuine Microsoft Software Guarantee', 'All our Microsoft products are 100% genuine with valid licenses. Get authentic software with full Microsoft support and updates.', '/api/announcements/5/image', FALSE, 'active');

-- Insert deals
INSERT INTO deals (title, description, product_id, old_price, new_price, discount_percentage, badge, background_image_url, is_featured, status, expires_at) VALUES
('Microsoft Office 2021 Special Price', 'Get Microsoft Office Professional Plus 2021 at the best price. Complete productivity suite with lifetime license.', 3, 150000.00, 120000.00, 20, 'Best Seller', '/api/deals/office-2021/background-image', TRUE, 'active', '2025-07-18 07:25:23'),
('Office 365 Annual Subscription', 'Subscribe to Office 365 and get continuous updates, cloud storage, and premium features. Best value for businesses.', 4, 60000.00, 50000.00, 17, 'Popular Choice', '/api/deals/office-365/image', TRUE, 'active', '2025-08-17 07:25:23'),
('Microsoft Project & Visio Bundle', 'Get both Microsoft Project and Visio Professional 2021 at a special bundle price. Perfect for project managers and designers.', 7, 90000.00, 75000.00, 17, 'Bundle Deal', '/api/deals/project-visio/image', FALSE, 'active', '2025-07-03 07:25:23');

-- Insert hero slides
INSERT INTO hero_slides (title, description, background_image_url, product_id, is_new, status, sort_order) VALUES
('Microsoft Office Professional Plus 2021', 'Get the latest Microsoft Office suite with enhanced features, improved performance, and modern design. Perfect for professionals and businesses.', '/api/products/office-2021/hero-image', 3, TRUE, 'active', 1),
('Microsoft Office 365 - Always Updated', 'Subscribe to Office 365 and never worry about updates again. Get the latest features, cloud storage, and continuous productivity improvements.', '/api/products/office-365/hero-image', 4, TRUE, 'active', 2),
('Complete Microsoft Software Solutions', 'From Office productivity to Project management and Visio diagramming - get all your Microsoft software needs in one place with genuine licenses.', '/api/products/complete-suite/hero-image', 1, FALSE, 'active', 3);

-- Insert users
INSERT INTO users (email, password, name, account_type, google_id, profile_picture) VALUES
('test@example.com', '$2b$10$6.2aamESfPTT7S.7GtDk4.UZq5Q7e9duq9mEzKGCFkHdzx9iVXbuW', 'test', 'admin', NULL, NULL),
('test2@example.com', '$2b$10$nnW4cKaS.rTbCXf0acAyN.9x59uKCCgtmZ3zYYAZvo0ALUV6WVvJW', 'test2', 'user', NULL, NULL),
('fajar.febrian020202@gmail.com', '$2b$10$E.i88SNd6hZVSSqsGGLYBOEo/SUqjiclKffZJaJoEwjxdRmHpoaTi', 'Muhammad Fajar Febrian', 'user', '101149504362764463138', 'https://lh3.googleusercontent.com/a/ACg8ocIs8kdgb9R54Mx5f1ezdyqL1nnKitIVGA-pWq5ysTotxLvBXrk=s96-c'),
('admin@nixty.com', '$2b$10$XeHYX9LlFiJBfcbg.jGX8uVVaul5mWBhYl2aHk8eQJKG9hSKwY1Mu', 'Admin User', 'admin', NULL, NULL),
('user@nixty.com', '$2b$10$4Ky.qdI2MvgvJCyYLIAJXeRbX5hSMZ9TBgUJMNf0DKOGhOHBVRMSe', 'Regular User', 'user', NULL, NULL);

-- Insert product licenses
INSERT INTO product_licenses (product_id, license_type, product_key, email, password, additional_info, expires_at, status, notes) VALUES
-- Office 2016 licenses
(1, 'product_key', 'NKJFK-GPHP7-G8C3J-P6JXR-HQRJR', NULL, NULL, 'Microsoft Office Pro Plus 2016 - Retail License', NULL, 'available', 'Valid for single PC installation'),
(1, 'product_key', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', NULL, NULL, 'Microsoft Office Pro Plus 2016 - Volume License', NULL, 'available', 'Valid for single PC installation'),
(1, 'product_key', 'XQNVK-8JYDB-WJ9W3-YJ8YR-WFG99', NULL, NULL, 'Microsoft Office Pro Plus 2016 - OEM License', NULL, 'available', 'Valid for single PC installation'),

-- Office 2019 licenses
(2, 'product_key', 'NKJFK-GPHP7-G8C3J-P6JXR-HQRJR', NULL, NULL, 'Microsoft Office Pro Plus 2019 - Retail License', NULL, 'available', 'Valid for single PC installation'),
(2, 'product_key', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', NULL, NULL, 'Microsoft Office Pro Plus 2019 - Volume License', NULL, 'available', 'Valid for single PC installation'),

-- Office 2021 licenses
(3, 'product_key', 'FXYTK-NJJ8C-GB6DW-3DYQT-6F7TH', NULL, NULL, 'Microsoft Office Pro Plus 2021 - Retail License', NULL, 'available', 'Valid for single PC installation'),
(3, 'product_key', 'KDX7X-BNVR8-TXXGX-4Q7Y8-78VT3', NULL, NULL, 'Microsoft Office Pro Plus 2021 - Volume License', NULL, 'available', 'Valid for single PC installation'),

-- Office 365 licenses
(4, 'email_password', NULL, 'office365user1@nixtystore.com', 'SecurePass123!', 'Microsoft Office 365 - 1 Year Subscription', '2026-06-20 07:25:23', 'available', 'Includes 1TB OneDrive storage'),
(4, 'email_password', NULL, 'office365user2@nixtystore.com', 'SecurePass456!', 'Microsoft Office 365 - 1 Year Subscription', '2026-06-20 07:25:23', 'available', 'Includes 1TB OneDrive storage'),
(4, 'email_password', NULL, 'office365user3@nixtystore.com', 'SecurePass789!', 'Microsoft Office 365 - 1 Year Subscription', '2026-06-20 07:25:23', 'available', 'Includes 1TB OneDrive storage'),

-- Project licenses
(5, 'product_key', 'YG9NW-3K39V-2T3HJ-93F3Q-G83KT', NULL, NULL, 'Microsoft Project Pro 2016 - Retail License', NULL, 'available', 'Professional project management'),
(6, 'product_key', 'B4NPR-3FKK7-T2MBV-FRQ4W-PKD2B', NULL, NULL, 'Microsoft Project Pro 2019 - Retail License', NULL, 'available', 'Enhanced project management'),
(7, 'product_key', 'FTNXH-6F7QF-W7Q2V-4Y9R3-BHD3F', NULL, NULL, 'Microsoft Project Pro 2021 - Retail License', NULL, 'available', 'Latest project management features'),

-- Visio licenses
(8, 'product_key', 'PD3PC-RHNGV-FXJ29-8JK7D-RJRJK', NULL, NULL, 'Microsoft Visio Pro 2016 - Retail License', NULL, 'available', 'Professional diagramming tool'),
(9, 'product_key', '9BGNQ-K37YR-RQHF2-38RQ3-7VCBB', NULL, NULL, 'Microsoft Visio Pro 2019 - Retail License', NULL, 'available', 'Enhanced diagramming features'),
(10, 'product_key', 'KNH8D-FGHT4-T8RJK-QJRJK-QJRJK', NULL, NULL, 'Microsoft Visio Pro 2021 - Retail License', NULL, 'available', 'Latest diagramming features');
