
-- Create a schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS test;
USE test;



-- =============================================
-- Utilities
-- =============================================


/**
 * Table: provinces
 * Description: Stores information about provinces.
 *
 * Columns:
 * - province_id: Unique identifier for each province.
 * - province_name: Name of the province (unique).
 * - region: Region where the province is located.
 *
 * Indexes:
 * - uk_province_name: Ensures unique province names.
 * - idx_region: Improves query performance on region-based searches.
 */
CREATE TABLE IF NOT EXISTS provinces (
    province_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    province_name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    UNIQUE KEY uk_province_name (province_name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: municipalities
 * Description: Stores information about municipalities.
 *
 * Columns:
 * - municipality_id: Unique identifier for each municipality.
 * - municipality_name: Name of the municipality.
 * - province_id: Foreign key referencing the provinces table.
 * - municipality_type: Type of municipality (City or Municipality).
 *
 * Constraints:
 * - uk_municipality_name_province: Ensures unique combination of municipality name and province.
 * - fk_municipality_province: Foreign key relationship with provinces table.
 *
 * Indexes:
 * - idx_municipality_type: Improves query performance on municipality type-based searches.
 */
CREATE TABLE IF NOT EXISTS municipalities (
    municipality_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    municipality_name VARCHAR(255) NOT NULL,
    province_id INT UNSIGNED NOT NULL,
    municipality_type ENUM('City', 'Municipality') NOT NULL DEFAULT 'Municipality',
    UNIQUE KEY uk_municipality_name_province (municipality_name, province_id),
    FOREIGN KEY fk_municipality_province (province_id) REFERENCES provinces(province_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_municipality_type (municipality_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: barangays
 * Description: Stores information about barangays (smallest administrative division in the Philippines).
 *
 * Columns:
 * - barangay_id: Unique identifier for each barangay.
 * - barangay_name: Name of the barangay.
 * - municipality_id: Foreign key referencing the municipalities table.
 *
 * Constraints:
 * - uk_barangay_name_municipality: Ensures unique combination of barangay name and municipality.
 * - fk_barangay_municipality: Foreign key relationship with municipalities table.
 */
CREATE TABLE IF NOT EXISTS barangays (
    barangay_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barangay_name VARCHAR(255) NOT NULL,
    municipality_id INT UNSIGNED NOT NULL,
    UNIQUE KEY uk_barangay_name_municipality (barangay_name, municipality_id),
    FOREIGN KEY fk_barangay_municipality (municipality_id) REFERENCES municipalities(municipality_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: streets
 * Description: Stores information about streets within barangays.
 *
 * Columns:
 * - street_id: Unique identifier for each street.
 * - street_name: Name of the street.
 * - barangay_id: Foreign key referencing the barangays table.
 * - street_type: Type of street (e.g., Avenue, Street, Road).
 *
 * Constraints:
 * - uk_street_name_barangay: Ensures unique combination of street name and barangay.
 * - fk_street_barangay: Foreign key relationship with barangays table.
 *
 * Indexes:
 * - idx_street_type: Improves query performance on street type-based searches.
 */
CREATE TABLE IF NOT EXISTS streets (
    street_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    street_name VARCHAR(255) NOT NULL,
    barangay_id INT UNSIGNED NOT NULL,
    street_type ENUM('Avenue', 'Street', 'Road', 'Boulevard', 'Lane', 'Drive'),
    UNIQUE KEY uk_street_name_barangay (street_name, barangay_id),
    FOREIGN KEY fk_street_barangay (barangay_id) REFERENCES barangays(barangay_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_street_type (street_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: occupations
 * Description: Stores occupation options for residents.
 *
 * Columns:
 * - occupation_id: Unique identifier for each occupation.
 * - occupation_name: Name of the occupation (unique).
 */
CREATE TABLE IF NOT EXISTS occupations (
    occupation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    occupation_name VARCHAR(255) NOT NULL,
    UNIQUE KEY uk_occupation_name (occupation_name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: nationalities
 * Description: Stores nationality options for residents.
 *
 * Columns:
 * - nationality_id: Unique identifier for each nationality.
 * - nationality_name: Name of the nationality (unique).
 */
CREATE TABLE IF NOT EXISTS nationalities (
    nationality_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nationality_name VARCHAR(255) NOT NULL,
    UNIQUE KEY uk_nationality_name (nationality_name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: religions
 * Description: Stores religion options for residents.
 *
 * Columns:
 * - religion_id: Unique identifier for each religion.
 * - religion_name: Name of the religion (unique).
 */
CREATE TABLE IF NOT EXISTS religions (
    religion_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    religion_name VARCHAR(255) NOT NULL,
    UNIQUE KEY uk_religion_name (religion_name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: benefits
 * Description: Stores information about benefits available to residents.
 *
 * Columns:
 * - benefit_id: Unique identifier for each benefit.
 * - benefit_name: Name of the benefit (unique).
 */
CREATE TABLE IF NOT EXISTS benefits (
    benefit_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    benefit_name VARCHAR(255) NOT NULL,
    UNIQUE KEY uk_benefit_name (benefit_name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





-- =============================================
-- Residential Records
-- =============================================


/**
 * Table: residents
 * Description: Stores comprehensive information about residents.
 *
 * Columns:
 * - resident_id: Unique identifier for each resident.
 * - full_name: Full name of the resident.
 * - first_name, last_name, middle_name: Individual name components.
 * - gender: Gender of the resident.
 * - image_base64, fingerprint_base64: Biometric data stored as base64 strings.
 * - date_of_birth: Resident's date of birth.
 * - civil_status: Marital status of the resident.
 * - occupation_id, nationality_id, religion_id, benefit_id: Foreign keys to respective tables.
 * - is_archived: Flag to indicate if the resident record is archived.
 *
 * Constraints:
 * - Foreign key relationships with occupations, nationalities, religions, and benefits tables.
 *
 * Indexes:
 * - idx_full_name, idx_date_of_birth, idx_civil_status: Improve query performance on these fields.
 */
CREATE TABLE IF NOT EXISTS residents (
    resident_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    image_base64 LONGTEXT NOT NULL,
    fingerprint_base64 LONGTEXT,
    date_of_birth DATE NOT NULL,
    civil_status ENUM('Single', 'Married', 'Divorced', 'Widowed') NOT NULL,
    occupation_id INT UNSIGNED,
    nationality_id INT UNSIGNED,
    religion_id INT UNSIGNED,
    benefit_id INT UNSIGNED,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_resident_occupation (occupation_id) REFERENCES occupations(occupation_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY fk_resident_nationality (nationality_id) REFERENCES nationalities(nationality_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY fk_resident_religion (religion_id) REFERENCES religions(religion_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY fk_resident_benefit (benefit_id) REFERENCES benefits(benefit_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_full_name (full_name),
    INDEX idx_date_of_birth (date_of_birth),
    INDEX idx_civil_status (civil_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: addresses
 * Description: Stores detailed address information for residents.
 *
 * Columns:
 * - address_id: Unique identifier for each address.
 * - resident_id: Foreign key referencing the residents table.
 * - house_number: House number of the residence.
 * - street_id, barangay_id, municipality_id, province_id: Foreign keys to respective location tables.
 * - postal_code: Postal code of the address.
 *
 * Constraints:
 * - Foreign key relationships with residents, streets, barangays, municipalities, and provinces tables.
 *
 * Indexes:
 * - idx_postal_code: Improves query performance on postal code-based searches.
 */
CREATE TABLE IF NOT EXISTS addresses (
    address_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resident_id BIGINT UNSIGNED NOT NULL,
    house_number VARCHAR(20) NOT NULL,
    street_id INT UNSIGNED,
    barangay_id INT UNSIGNED,
    municipality_id INT UNSIGNED,
    province_id INT UNSIGNED,
    postal_code VARCHAR(10),
    FOREIGN KEY fk_resident_id (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY fk_address_street (street_id) REFERENCES streets(street_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY fk_address_barangay (barangay_id) REFERENCES barangays(barangay_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY fk_address_municipality (municipality_id) REFERENCES municipalities(municipality_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY fk_address_province (province_id) REFERENCES provinces(province_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_postal_code (postal_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: contacts
 * Description: Stores contact information for residents.
 *
 * Columns:
 * - contact_id: Unique identifier for each contact entry.
 * - resident_id: Foreign key referencing the residents table.
 * - email: Email address of the resident.
 * - mobile: Mobile number of the resident.
 *
 * Constraints:
 * - Foreign key relationship with residents table.
 */
CREATE TABLE IF NOT EXISTS contacts (
    contact_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resident_id BIGINT UNSIGNED NOT NULL,
    email VARCHAR(255),
    mobile VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_contact_resident (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: documents
 * Description: Stores information about documents issued to residents.
 *
 * Columns:
 * - document_id: Unique identifier for each document.
 * - document_title: Type of document issued.
 * - resident_id: Foreign key referencing the residents table.
 * - required_fields: JSON array storing required fields for the document.
 * - issued_by: Name of the person who issued the document.
 * - price: fee for processing the document
 * - issued_date: Date when the document was issued.
 *
 * Constraints:
 * - Foreign key relationship with residents table.
 */
CREATE TABLE IF NOT EXISTS documents (
    document_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_title ENUM('Barangay Business Clearance', 'Barangay Clearance', 'Certificate of Indigency', 'Certificate of Residency') NOT NULL,
    resident_id BIGINT UNSIGNED NOT NULL,
    required_fields JSON NOT NULL,
    issued_by VARCHAR(255) NOT NULL,
    price INT UNSIGNED NOT NULL,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_issued_document_resident (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS queue (
    queue_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resident_id BIGINT UNSIGNED NOT NULL,
    document ENUM('Barangay Business Clearance', 'Certificate of Residency', 'Certificate of Indigency') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_queue_resident (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 * Table: auth
 * Description: Stores authentication information for residents.
 *
 * Columns:
 * - auth_id: Unique identifier for each authentication record.
 * - role: Role of the resident (admin, secretary, treasurer, volunteer).
 * - resident_id: Foreign key referencing the residents table.
 * - username: Username for the resident.
 * - password: Password for the resident.
 *
 * Constraints:
 * - Foreign key relationship with residents table.
 */
CREATE TABLE IF NOT EXISTS auth (
    auth_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin', 'resident') NOT NULL,
    resident_id BIGINT UNSIGNED NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    face_recognition VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_auth_resident (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    auth_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    device_info TEXT,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_session_auth (auth_id) REFERENCES auth(auth_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_auth_id (auth_id),
    INDEX idx_last_active (last_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================
-- Insert dummy data
-- =============================================
-- Insert into provinces
INSERT INTO provinces (province_name, region)
VALUES ('Novaliches', 'Central Luzon');

-- Insert into municipalities
INSERT INTO municipalities (municipality_name, province_id, municipality_type) VALUES
('Sauyo', 1, 'Municipality');

-- Insert into barangays
INSERT INTO barangays (barangay_name, municipality_id)
VALUES ('Bambang', 1);

-- Insert into streets
INSERT INTO streets (street_name, barangay_id, street_type) VALUES
('1st Laguna Street', 1, 'Street'),
('2nd Laguna Street', 1, 'Street'),
('Abbey Road', 1, 'Street'),
('Acacia Street', 1, 'Street'),
('Ad Valorem', 1, 'Street'),
('Aganan Street', 1, 'Street'),
('Agno', 1, 'Street'),
('Agos Lane', 1, 'Street'),
('Agusan Street', 1, 'Street'),
('Algebra', 1, 'Street'),
('Alimango Street', 1, 'Street'),
('Allah', 1, 'Street'),
('Almagica Street', 1, 'Street'),
('Angat', 1, 'Street'),
('Annalisa Street', 1, 'Street'),
('Aplaya', 1, 'Street'),
('Apo 2nd Street', 1, 'Street'),
('Aries Street', 1, 'Street'),
('Arsenio Street', 1, 'Street'),
('Aster', 1, 'Street'),
('Astoria', 1, 'Street'),
('Barit Extension', 1, 'Street'),
('Barit Street', 1, 'Street'),
('Bataan Street', 1, 'Street'),
('Bawa Street', 1, 'Street'),
('Beethoven Street', 1, 'Street'),
('Biya Street', 1, 'Street'),
('Blue Sky', 1, 'Street'),
('Bluebird Street', 1, 'Street'),
('Bougainvilla Street', 1, 'Street'),
('Bucao Street', 1, 'Street'),
('C. Francisco Street', 1, 'Street'),
('Calaca Street', 1, 'Street'),
('Calla Street', 1, 'Street'),
('Camia Street', 1, 'Street'),
('Camiling', 1, 'Street'),
('Candido Street', 1, 'Street'),
('Capital Gain', 1, 'Street'),
('Capizan Street', 1, 'Street'),
('Capricorn Street', 1, 'Street'),
('Carnation', 1, 'Street'),
('Carnation Street', 1, 'Street'),
('Castle Street', 1, 'Street'),
('Cedar Street', 1, 'Street'),
('Celosia Street', 1, 'Street'),
('Champaca Street', 1, 'Street'),
('Charleville', 1, 'Street'),
('Chestnut', 1, 'Street'),
('Chestnut Street', 1, 'Street'),
('Chico', 1, 'Street'),
('Chopin Street', 1, 'Street'),
('Clifton Street', 1, 'Street'),
('Cotabato Street', 1, 'Street'),
('Crocus Street', 1, 'Street'),
('Cura Lane', 1, 'Street'),
('Cypress Street', 1, 'Street'),
('D. Muñoz Street', 1, 'Street'),
('Daffodils', 1, 'Street'),
('Dahlia Avenue', 1, 'Street'),
('Dahlia Extension', 1, 'Street'),
('Daisy', 1, 'Street'),
('Daisy Street', 1, 'Street'),
('Dalag Street', 1, 'Street'),
('Dao Street', 1, 'Street'),
('De Vega Compound', 1, 'Street'),
('Depot Street', 1, 'Street'),
('Derby', 1, 'Street'),
('Dinar Street', 1, 'Street'),
('Doña Angeling Street', 1, 'Street'),
('Doña Asuncion Street', 1, 'Street'),
('Doña Consuelo Street', 1, 'Street'),
('Doña Fildela Street', 1, 'Street'),
('Doña Juana Street', 1, 'Street'),
('Doña Juana Street Extension', 1, 'Street'),
('Doña Sabrina Street', 1, 'Street'),
('Doña Segundo Street', 1, 'Street'),
('Doña Teresa Street', 1, 'Street'),
('Dollar Street', 1, 'Street'),
('Dolores Street', 1, 'Street'),
('Don Jose Street', 1, 'Street'),
('Don Julio Gregorio Avenue (proposed)', 1, 'Street'),
('Don Julio Gregorio Street', 1, 'Street'),
('Don Raymundo Street', 1, 'Street'),
('Don T. Lectura Street', 1, 'Street'),
('Don Vicente Street', 1, 'Street'),
('Donors', 1, 'Street'),
('El Capitan Street', 1, 'Street'),
('Elm', 1, 'Street'),
('Emerald Street', 1, 'Street'),
('Erwin Street', 1, 'Street'),
('Excise', 1, 'Street'),
('F. del Mundo Street', 1, 'Street'),
('Fercon Street', 1, 'Street'),
('Florville Street', 1, 'Street'),
('Florville Street Extension', 1, 'Street'),
('Fordham', 1, 'Street'),
('Franchise', 1, 'Street'),
('Franco Street', 1, 'Street'),
('Fuschia Street', 1, 'Street'),
('Galatian Street', 1, 'Street'),
('Garland Street', 1, 'Street'),
('Genesis Street', 1, 'Street'),
('Geometry', 1, 'Street'),
('Georgia', 1, 'Street'),
('Ghana', 1, 'Street'),
('Glenmont Circle', 1, 'Street'),
('Gold Street', 1, 'Street'),
('Greece', 1, 'Street'),
('Greenland Street', 1, 'Street'),
('Greenlane', 1, 'Street'),
('Greenview Avenue', 1, 'Street'),
('Greenville Drive', 1, 'Street'),
('Greg Street', 1, 'Street'),
('Grenada', 1, 'Street'),
('Guadeloupe', 1, 'Street'),
('Hammer Road', 1, 'Street'),
('Harlington Street', 1, 'Street'),
('Harvard', 1, 'Street'),
('Hikom Street', 1, 'Street'),
('Hito Street', 1, 'Street'),
('Ibayo II Street', 1, 'Street'),
('Ilang-ilang Street', 1, 'Street'),
('Income', 1, 'Street'),
('Jade Street', 1, 'Street'),
('Jalaur', 1, 'Street'),
('Jalaur Triangle', 1, 'Street'),
('Jamaica', 1, 'Street'),
('Jasmin Street', 1, 'Street'),
('Jean Street', 1, 'Street'),
('Jeremiah Street', 1, 'Street'),
('Kanduli Street', 1, 'Street'),
('Karen Street', 1, 'Street'),
('Law', 1, 'Street'),
('Leo Street', 1, 'Street'),
('Liberty Street', 1, 'Street'),
('Libra Street', 1, 'Street'),
('Linaria Street', 1, 'Street'),
('Lionel Street', 1, 'Street'),
('Lipton Street', 1, 'Street'),
('Lobella Street', 1, 'Street'),
('Los Alamos Street', 1, 'Street'),
('Los Olivos Street', 1, 'Street'),
('Lupinus Street', 1, 'Street'),
('M. Gabriel Street', 1, 'Street'),
('Magat', 1, 'Street'),
('Magnolia Street', 1, 'Street'),
('Main Avenue', 1, 'Street'),
('Main Street', 1, 'Street'),
('Malachi Street', 1, 'Street'),
('Malaya Street', 1, 'Street'),
('Manchester', 1, 'Street'),
('Maranding', 1, 'Street'),
('Marbel', 1, 'Street'),
('Maria Cristina Street', 1, 'Street'),
('Marian Street', 1, 'Street'),
('Marianito Street', 1, 'Street'),
('Matimtim Street', 1, 'Street'),
('Merry', 1, 'Street'),
('Mindanao Avenue', 1, 'Street'),
('Mining', 1, 'Street'),
('Monroe Street', 1, 'Street'),
('Mozart Street', 1, 'Street'),
('MWSS Service Road', 1, 'Street'),
('Naga Street', 1, 'Street'),
('Nashville Road', 1, 'Street'),
('Naval Extension', 1, 'Street'),
('New Garden', 1, 'Street'),
('Nuclear Street', 1, 'Street'),
('Old Sauyo Road', 1, 'Street'),
('Orchid Street', 1, 'Street'),
('Painty', 1, 'Street'),
('Palico Lane', 1, 'Street'),
('Pantabangan', 1, 'Street'),
('Papua', 1, 'Street'),
('Peachtree', 1, 'Street'),
('Petunia Street', 1, 'Street'),
('Philippine Street', 1, 'Street'),
('Phlox Street', 1, 'Street'),
('Pineapple Street', 1, 'Street'),
('Pines Street', 1, 'Street'),
('Poblacion', 1, 'Street'),
('Polland Street', 1, 'Street'),
('Pope Pius Street', 1, 'Street'),
('Pulot Street', 1, 'Street'),
('Regalado Street', 1, 'Street'),
('Republic Avenue', 1, 'Street'),
('Republic Street', 1, 'Street'),
('River', 1, 'Street'),
('Rizal', 1, 'Street'),
('Rome', 1, 'Street'),
('Ruby Street', 1, 'Street'),
('Russia', 1, 'Street'),
('Sagad Street', 1, 'Street'),
('Saguan Street', 1, 'Street'),
('Samaria Street', 1, 'Street'),
('San Agustin', 1, 'Street'),
('San Juan', 1, 'Street'),
('San Vicente Street', 1, 'Street'),
('Santa Catalina', 1, 'Street'),
('Santa Elena', 1, 'Street'),
('Santa Felomina', 1, 'Street'),
('Santa Teresita', 1, 'Street'),
('Sarah Street', 1, 'Street'),
('Sapphire', 1, 'Street'),
('Saudi Street', 1, 'Street'),
('Sea Lane', 1, 'Street'),
('Sebio Street', 1, 'Street'),
('Shalom Street', 1, 'Street'),
('Sharp Street', 1, 'Street'),
('Sheep Street', 1, 'Street'),
('South Street', 1, 'Street'),
('Spring', 1, 'Street'),
('Stallion Street', 1, 'Street'),
('Star Street', 1, 'Street'),
('Station', 1, 'Street'),
('Stone Road', 1, 'Street'),
('Sun Street', 1, 'Street'),
('Tacloban', 1, 'Street'),
('Tagnipa Street', 1, 'Street'),
('Talisay Street', 1, 'Street'),
('Talon Street', 1, 'Street'),
('Tandang Sora', 1, 'Street'),
('Tangos', 1, 'Street'),
('Tapucan Street', 1, 'Street'),
('Tarong', 1, 'Street'),
('Taysan', 1, 'Street'),
('Teodoro Street', 1, 'Street'),
('Thames', 1, 'Street'),
('Thrift', 1, 'Street'),
('Tokio Street', 1, 'Street'),
('Tondo', 1, 'Street'),
('Tooth Lane', 1, 'Street'),
('Torres Street', 1, 'Street'),
('Turquoise', 1, 'Street'),
('Union', 1, 'Street'),
('Venice', 1, 'Street'),
('Vera Cruz', 1, 'Street'),
('Villa Street', 1, 'Street'),
('Villamor Street', 1, 'Street'),
('Vintage Street', 1, 'Street'),
('Virgo Street', 1, 'Street'),
('Washington Street', 1, 'Street'),
('West Avenue', 1, 'Street'),
('West Drive', 1, 'Street'),
('West Lane', 1, 'Street'),
('Windmill', 1, 'Street'),
('Wood Street', 1, 'Street'),
('Yale Street', 1, 'Street'),
('Yemen', 1, 'Street');


-- Insert into occupations
INSERT INTO occupations (occupation_name)
VALUES
    ('N/A'),
    ('Engineer'),
    ('Doctor'),
    ('Teacher'),
    ('Nurse'),
    ('Accountant'),
    ('Lawyer'),
    ('Architect'),
    ('Chef'),
    ('Artist'),
    ('Carpenter'),
    ('Electrician'),
    ('Mechanic'),
    ('Pharmacist'),
    ('Pilot'),
    ('Scientist'),
    ('Software Developer'),
    ('Data Analyst'),
    ('Police Officer'),
    ('Firefighter'),
    ('Salesperson'),
    ('Receptionist'),
    ('Writer'),
    ('Plumber'),
    ('Dentist'),
    ('Veterinarian'),
    ('Photographer'),
    ('Hairdresser'),
    ('Graphic Designer'),
    ('Journalist');


-- Insert into nationalities
INSERT INTO nationalities (nationality_name)
VALUES
    ('N/A'),
    ('Filipino'),
    ('American'),
    ('Canadian'),
    ('Chinese'),
    ('Japanese'),
    ('Korean'),
    ('Australian'),
    ('British'),
    ('French'),
    ('German'),
    ('Italian'),
    ('Indian'),
    ('Mexican'),
    ('Brazilian'),
    ('Russian'),
    ('Spanish'),
    ('Vietnamese'),
    ('Indonesian'),
    ('Malaysian'),
    ('Saudi'),
    ('Thai'),
    ('Turkish'),
    ('South African'),
    ('Argentinian'),
    ('Egyptian'),
    ('Dutch'),
    ('Swedish'),
    ('Norwegian'),
    ('Irish'),
    ('Swiss');


-- Insert into religions
INSERT INTO religions (religion_name)
VALUES
    ('N/A'),
    ('Catholic'),
    ('Christian'),
    ('Muslim'),
    ('Hindu'),
    ('Buddhist'),
    ('Jewish'),
    ('Protestant'),
    ('Orthodox'),
    ('Anglican'),
    ('Baptist'),
    ('Methodist'),
    ('Lutheran'),
    ('Sikh'),
    ('Jain'),
    ('Shinto'),
    ('Taoist'),
    ('Mormon'),
    ('Presbyterian'),
    ('Pentecostal'),
    ('Evangelical'),
    ('Quaker'),
    ('Unitarian'),
    ('Scientologist');

-- Insert into benefits
INSERT INTO benefits (benefit_name)
VALUES
    ('N/A'),
    ('Health Insurance'),
    ('PhilHealth'),
    ('SSS (Social Security System)'),
    ('Pag-IBIG Fund'),
    ('13th Month Pay'),
    ('Performance Bonus'),
    ('Overtime Pay'),
    ('Meal Allowance'),
    ('Transportation Allowance'),
    ('Holidays Pay'),
    ('Paternity Leave'),
    ('Maternity Leave'),
    ('Sick Leave'),
    ('Vacation Leave'),
    ('Government Mandated Benefits'),
    ('Life Insurance'),
    ('Retirement Benefits'),
    ('Rice Subsidy'),
    ('HMO (Health Maintenance Organization)'),
    ('Legal Assistance'),
    ('Uniform Allowance'),
    ('Personal Accident Insurance'),
    ('Dependents Benefits'),
    ('4Ps (Pantawid Pamilyang Pilipino Program)'),
    ('Senior Citizen Discount'),
    ('Solo Parent Benefits'),
    ('Senior Citizen Financial Assistance'),
    ('Education Subsidy'),
    ('Philippine Veterans Affairs Office (PVAO) Benefits'),
    ('Cash Subsidy for Disadvantaged Families'),
    ('PWD (Persons with Disabilities) Benefits'),
    ('Government Scholarship Programs');


-- Insert into residents
INSERT INTO residents (full_name, first_name, last_name, middle_name, gender, image_base64, fingerprint_base64, date_of_birth, civil_status, occupation_id, nationality_id, religion_id, benefit_id, is_archived)
VALUES ('Shaira Marie T. Curiano', 'Shaira Marie', 'Curiano', 'T', 'Male', 'base64encodedimage', 'base64encodedfingerprint', '2006-01-01', 'Single', 1, 1, 1, 1, FALSE);

-- Insert into addresses
INSERT INTO addresses (resident_id, house_number, street_id, barangay_id, municipality_id, province_id, postal_code)
VALUES (1, '123', 1, 1, 1, 1, '12345');

-- Insert into contacts
INSERT INTO contacts (resident_id, email, mobile)
VALUES (1, 'example@example.com', '1234567890');

-- Insert into documents
INSERT INTO documents (document_title, resident_id, required_fields, issued_by, price, issued_date)
VALUES
('Barangay Business Clearance', 1, '{"Business Name": "ABC Corp", "Address": "123 Main St"}', 'Secretary Kristina Marie Santos', 20, CURRENT_TIMESTAMP),
('Barangay Clearance', 1, '{"Purpose": "General Clearance", "Address": "456 Elm St"}', 'Secretary Kristina Marie Santos', 20, CURRENT_TIMESTAMP),
('Certificate of Indigency', 1, '{"Income": "Below Minimum Wage", "Dependents": "3"}', 'Secretary Kristina Marie Santos', 20, CURRENT_TIMESTAMP),
('Certificate of Residency', 1, '{"Years of Residency": "5", "Address": "789 Oak St"}', 'Secretary Kristina Marie Santos', 20, CURRENT_TIMESTAMP);

-- Insert admin role
INSERT INTO auth (role, resident_id, username, password, face_recognition)
VALUES ('admin', 1, 'user1', '$2b$10$j1BFG4hR07qGvKs6cc4jE.kJl5Ko3eRhBl3pbMCwIH8DJiRSFYYgW', 'test');
