CREATE DATABASE IF NOT EXISTS mundial_ar;
USE mundial_ar;

-- Tabla de Paises (Equipos)
CREATE TABLE paises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL UNIQUE, -- Ej: MEX, ARG, BRA
    nombre VARCHAR(100) NOT NULL,
    grupo VARCHAR(1),
    ranking_fifa INT,
    video_url VARCHAR(255) -- URL del video oficial
);

-- Tabla de Estadios
CREATE TABLE estadios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pais_id INT,
    nombre VARCHAR(100),
    ciudad VARCHAR(100),
    capacidad INT,
    FOREIGN KEY (pais_id) REFERENCES paises(id)
);

-- Tabla de Trivia
CREATE TABLE trivias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pais_id INT,
    pregunta TEXT,
    opciones JSON, -- Guardaremos las opciones como ["A", "B", "C"]
    respuesta_correcta INT, -- Índice del array (0, 1, 2...)
    FOREIGN KEY (pais_id) REFERENCES paises(id)
);

-- DATOS DE PRUEBA (MÉXICO)
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) 
VALUES ('MEX', 'México', 'A', 15, './videoCuatro.mp4');

SET @mex_id = LAST_INSERT_ID();

INSERT INTO estadios (pais_id, nombre, ciudad, capacidad)
VALUES (@mex_id, 'Estadio Azteca', 'Ciudad de México', 87523);

INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta)
VALUES 
(@mex_id, '¿En qué año fue el primer mundial en México?', '["1970", "1986", "1994"]', 0),
(@mex_id, '¿Quién es el máximo goleador histórico?', '["Hugo Sánchez", "Chicharito", "Borgetti"]', 1),
(@mex_id, '¿Apodo de la selección?', '["La Roja", "El Tri", "La Albiceleste"]', 1);

-- COLOMBIA
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('COL', 'Colombia', 'C', 17, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'Estadio Metropolitano', 'Barranquilla', 46692);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿Cómo se apoda comúnmente la selección?', '["Los Cafeteros", "La Roja", "Los Charrúas"]', 0),
(@id, '¿Qué colores predominan en su bandera?', '["Amarillo, azul y rojo", "Verde y blanco", "Rojo y blanco"]', 0);

-- JAPÓN
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('JPN', 'Japón', 'E', 18, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'Estadio Nacional', 'Tokio', 68000);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿Cómo se conoce a la selección?', '["Samurai Blue", "Les Bleus", "Azzurri"]', 0),
(@id, '¿Qué elemento aparece en su bandera?', '["Una estrella", "Un círculo rojo", "Un dragón"]', 1);

-- ESPAÑA
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('ESP', 'España', 'B', 8, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'Santiago Bernabéu', 'Madrid', 81044);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿En qué año ganó España el Mundial?', '["2006", "2010", "2014"]', 1),
(@id, '¿Cómo se apoda la selección?', '["La Roja", "La Verde", "La Celeste"]', 0);

-- COREA DEL SUR
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('KOR', 'Corea del Sur', 'H', 23, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'Seoul World Cup Stadium', 'Seúl', 66704);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿Mejor resultado histórico en mundiales?', '["Campeón", "Finalista", "Semifinal (4º lugar)"]', 2);

-- PAÍSES BAJOS
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('NED', 'Países Bajos', 'D', 6, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'Johan Cruyff Arena', 'Ámsterdam', 55500);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿Color asociado a la selección?', '["Naranja", "Azul", "Verde"]', 0);

-- SUDÁFRICA
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('RSA', 'Sudáfrica', 'F', 66, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'FNB Stadium', 'Johannesburgo', 94736);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿Año en que organizó el Mundial?', '["2006", "2010", "2014"]', 1);

-- TÚNEZ
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('TUN', 'Túnez', 'G', 30, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'Stade Hammadi Agrebi', 'Radès', 60000);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿Apodo de la selección?', '["Águilas de Cartago", "Leones", "Faraones"]', 0);

-- URUGUAY
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('URU', 'Uruguay', 'H', 16, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'Estadio Centenario', 'Montevideo', 60235);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿Cuántos Mundiales ha ganado?', '["0", "1", "2"]', 2);

-- UZBEKISTÁN
INSERT INTO paises (codigo, nombre, grupo, ranking_fifa, video_url) VALUES ('UZB', 'Uzbekistán', 'A', 73, './videoCuatro.mp4');
SET @id = LAST_INSERT_ID();
INSERT INTO estadios (pais_id, nombre, ciudad, capacidad) VALUES (@id, 'Milliy Stadium', 'Taskent', 34000);
INSERT INTO trivias (pais_id, pregunta, opciones, respuesta_correcta) VALUES 
(@id, '¿En qué continente está?', '["Europa", "Asia", "África"]', 1);