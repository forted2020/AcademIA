-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-07-2025 a las 23:13:34
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `academia`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_asistencia`
--

CREATE TABLE `tbl_asistencia` (
  `id_inasistencia` int(11) NOT NULL,
  `fecha` date NOT NULL COMMENT 'Fecha de la asistencia',
  `entidad_id` int(11) NOT NULL COMMENT 'ID de la entidad (alumno/docente)',
  `curso_id` int(11) NOT NULL COMMENT 'ID del curso',
  `materia_id` int(11) NOT NULL COMMENT 'ID de la materia',
  `tipo_asistencia_id` int(11) NOT NULL COMMENT 'ID del tipo de asistencia',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_curso`
--

CREATE TABLE `tbl_curso` (
  `id_curso` int(11) NOT NULL,
  `curso` varchar(50) NOT NULL COMMENT 'Nombre del curso',
  `division` varchar(10) NOT NULL COMMENT 'División del curso',
  `ciclo_lectivo` int(11) NOT NULL COMMENT 'Año lectivo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_entidad`
--

CREATE TABLE `tbl_entidad` (
  `id_entidad` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL COMMENT 'Nombre de la entidad',
  `apellido` varchar(100) NOT NULL COMMENT 'Apellido de la entidad',
  `tipos_entidad` varchar(100) DEFAULT NULL,
  `fec_nac` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `legajo` varchar(50) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `cuit` varchar(20) DEFAULT NULL,
  `cuenta_bancaria` varchar(100) DEFAULT NULL,
  `id_cliente` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_entidad`
--

INSERT INTO `tbl_entidad` (`id_entidad`, `usuario_id`, `nombre`, `apellido`, `tipos_entidad`, `fec_nac`, `created_at`, `updated_at`, `deleted_at`, `legajo`, `especialidad`, `cuit`, `cuenta_bancaria`, `id_cliente`) VALUES
(1, 11, 'Maximiliano', 'Ruiz', 'ADM', NULL, '2025-04-19 10:41:15', '2025-04-19 10:44:36', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 12, 'Juan', 'Perez', 'ALU', '2000-01-01', '2025-04-19 10:41:15', '2025-04-19 10:44:39', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 13, 'Carlos', 'Ramirez', 'DOC', NULL, '2025-04-19 10:41:15', '2025-04-19 10:44:42', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_inscripcion`
--

CREATE TABLE `tbl_inscripcion` (
  `id_inscripcion` int(11) NOT NULL,
  `entidad_id` int(11) NOT NULL COMMENT 'ID de la entidad inscrita',
  `materia_id` int(11) NOT NULL COMMENT 'ID de la materia',
  `tipo_inscripcion_id` int(11) NOT NULL COMMENT 'ID del tipo de inscripción',
  `fecha_inscripcion` date NOT NULL COMMENT 'Fecha de la inscripción',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_materia`
--

CREATE TABLE `tbl_materia` (
  `id_materia` int(11) NOT NULL,
  `nombre_materia_id` int(11) NOT NULL COMMENT 'ID del nombre de la materia',
  `curso_id` int(11) NOT NULL COMMENT 'ID del curso al que pertenece',
  `docente_id` int(11) NOT NULL COMMENT 'ID del docente encargado',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_nombre_materia`
--

CREATE TABLE `tbl_nombre_materia` (
  `id_nombre_materia` int(11) NOT NULL,
  `nombre_materia` varchar(100) NOT NULL COMMENT 'Nombre de la materia',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_nota`
--

CREATE TABLE `tbl_nota` (
  `id_nota` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL COMMENT 'ID de la materia',
  `alumno_id` int(11) NOT NULL COMMENT 'ID del alumno',
  `nota` int(11) NOT NULL COMMENT 'Valor de la nota' CHECK (`nota` between 0 and 10),
  `tipo_nota_id` int(11) NOT NULL COMMENT 'ID del tipo de nota',
  `fecha_carga` date NOT NULL DEFAULT curdate() COMMENT 'Fecha de carga de la nota',
  `usuario_carga_id` int(11) NOT NULL COMMENT 'ID del usuario que carga la nota',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_periodo`
--

CREATE TABLE `tbl_periodo` (
  `id_periodo` int(11) NOT NULL,
  `nombre_periodo` varchar(100) NOT NULL COMMENT 'Nombre del período (ej. Primer Cuatrimestre)',
  `fecha_inicio` date NOT NULL COMMENT 'Fecha de inicio del período',
  `fecha_fin` date NOT NULL COMMENT 'Fecha de fin del período',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_actividad`
--

CREATE TABLE `tbl_tipo_actividad` (
  `cod_tipo_actividad` int(11) NOT NULL,
  `nombre_actividad` varchar(100) NOT NULL COMMENT 'Nombre del tipo de actividad',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_asistencia`
--

CREATE TABLE `tbl_tipo_asistencia` (
  `id_tipo_asistencia` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL COMMENT 'Nombre del tipo de asistencia',
  `valor` decimal(10,2) NOT NULL COMMENT 'Valor o peso de la asistencia',
  `descripcion` text DEFAULT NULL COMMENT 'Descripción del tipo de asistencia',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_tipo_asistencia`
--

INSERT INTO `tbl_tipo_asistencia` (`id_tipo_asistencia`, `nombre`, `valor`, `descripcion`, `created_at`, `updated_at`, `deleted_at`) VALUES
(4, 'Tarde', 0.25, 'Llegó tarde a la clase', '2025-04-07 19:51:03', '2025-04-07 19:51:03', NULL),
(5, 'Falta completa', 1.00, 'No asistió a la clase', '2025-04-07 19:51:03', '2025-04-07 19:51:03', NULL),
(6, 'Falta EF', 0.50, 'Falta en educación física', '2025-04-07 19:51:03', '2025-04-07 19:51:03', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_entidad`
--

CREATE TABLE `tbl_tipo_entidad` (
  `cod_tipo_entidad` varchar(10) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_tipo_entidad`
--

INSERT INTO `tbl_tipo_entidad` (`cod_tipo_entidad`, `descripcion`, `created_at`, `updated_at`, `deleted_at`) VALUES
('ADM', 'Administrador', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL),
('ALU', 'Alumno', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL),
('CLI', 'Cliente', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL),
('DIR', 'Directivo', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL),
('DOC', 'Docente', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL),
('PROV', 'Proveedor', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_inscripcion`
--

CREATE TABLE `tbl_tipo_inscripcion` (
  `id_tipo_inscripcion` int(11) NOT NULL,
  `nombre_tipo_inscripcion` varchar(255) NOT NULL COMMENT 'Nombre del tipo de inscripción',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_nota`
--

CREATE TABLE `tbl_tipo_nota` (
  `id_tipo_nota` int(11) NOT NULL,
  `actividad_id` int(11) NOT NULL COMMENT 'ID del tipo de actividad',
  `periodo_id` int(11) NOT NULL COMMENT 'ID del período académico',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_usuario`
--

CREATE TABLE `tbl_tipo_usuario` (
  `cod_tipo_usuario` varchar(10) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_tipo_usuario`
--

INSERT INTO `tbl_tipo_usuario` (`cod_tipo_usuario`, `descripcion`, `created_at`, `updated_at`, `deleted_at`) VALUES
('ADM', 'Administrador', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL),
('DOC', 'Docente', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL),
('EST', 'Estudiante', '2025-04-19 09:51:13', '2025-04-19 09:51:13', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_usuarios`
--

CREATE TABLE `tbl_usuarios` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `is_email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `reset_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_usuarios`
--

INSERT INTO `tbl_usuarios` (`id`, `name`, `email`, `password`, `is_email_verified`, `reset_token`) VALUES
(1, 'juan_perez', 'juan.perez@email.com', 'contrasena123', 0, NULL),
(2, 'maria_gomez', 'maria.gomez@email.com', 'clave456', 0, NULL),
(3, 'carlos_lopez', 'carlos.lopez@email.com', 'segura789', 0, NULL),
(4, 'ana_martinez', 'ana.martinez@email.com', 'pass101', 0, NULL),
(5, 'luis_rodriguez', 'luis.rodriguez@email.com', 'luna202', 0, NULL),
(7, 'testuser', 'testuser@example.com', '$2b$12$wFWglcCZb79vvAUNOvqCr.hPWW/g7DVgH9.JTtpac6S47Sw7U96YC', 1, NULL),
(8, 'testuser2', 'tester2@example.com', '$2b$12$84JAry4wGfAWQfyuG0htUeQebTTF6dBdq75dfIY.MDJHvicBiWKZq', 0, 'mcFMldkYeG4Cu62Dgr2bvIpZYa_ksSgNVHeWkMeOxfE'),
(11, 'admin', 'maxir@gmail.com', '$2b$12$QSYvVCBn/7VGGt95R4dE/OlvRq.5QJwGGVnCIbuEhd/WrYM3a4dbC', 1, NULL),
(12, 'estudiante1', 'estudiante1@example.com', '$2b$12$hKNdvcR95s8vTwafOaRONOuxOHqJLcmbvIWqK2mSeKKFkCi2PvL3q', 1, NULL),
(13, 'docente1', 'docente1@example.com', '$2b$12$hKNdvcR95s8vTwafOaRONOuxOHqJLcmbvIWqK2mSeKKFkCi2PvL3q', 1, NULL),
(14, 'newuser', 'newuser@example.com', '$2b$12$RktCQ9qsFwsAVTTp9CWVX./C/rnWJx/to/tZ6QCOQY5BapNOqGna2', 0, 'nDgO9cC6cK30v-Qr-97hqX9aYMWVbDNT8f1HQ500Nzs'),
(15, 'testuser1', 'testuser1@example.com', '$2b$12$lqVkXhZNlJyMmQr./1NsXumU6hjmL04MnT4U4cMmF9BQbnK1LKfOm', 0, '-9XVUE-MQ7tUPLxbBqEEOVf98dNa14gtFccn_huD0Es'),
(16, 'testuser3', 'mail@mail123.com', '$2b$12$ynW6RjRBvtSfYKTr/L5tN.OtWKJYTG1RhQKk34eWYhrwzko4Dxw42', 1, NULL),
(17, 'testuser4', 'sistemmia.25@gmail.com', '$2b$12$b9ZC0Wc/kG2TFjlUuvbsIeALgOGoVSeUggmvKgV6FCSL02Lbr8cp6', 0, 'L050_e6yQzIq3VbnUFZ1wp-RR5kjxIK2vfVq4rCRb1k'),
(18, 'adminuser', 'sistema.academia.25@gmail.com', '$2b$12$5Sx6NDrMsKuFC1/oe9vCDuNNTv0rGJwPsJEb9NYUw.IOVZE2AhEWS', 1, NULL),
(19, 'mradmin', 'maxiruuu@gmail.com', '$2b$12$2/HsPemADcwbsHUUkVVfNO.G5bLQ1flbzLUXA9fS7Y4drB2Qn/Gge', 1, '3n9OIQnDfW50xFKn6c83J8gqu3rPTIv-gBwmp_W4mBA'),
(30, 'maxiruiz', 'maxiruiz@gmail.com', '$2b$12$69eaqU.dw9BJ/b2/gCvsQu3yfFAR5ZH2AK5/L50fki8u5yasl5Icm', 1, NULL),
(31, 'Pruebas', 'maxiruiz@hotmail.com', '$2b$12$6f5la98P6bMOSG44eCGRoe4hR1tynP1FP821MFhWpzontBv57l5bu', 0, 'B1dujvwFi8Fda0G1RFpCrgTbwZH50eRtXUQ-TztuMnc'),
(32, 'Juan ramón 2', 'maxiruiz21@gmail.com', '$2b$12$EzdIDJfF0niqVdG.xRfHaOsTWdYhZ3Y2MpttC5X1E.r4QCWvGuMHS', 0, 'wGHdv2p_rn2YufUHhiB78lC9JCZENCICHluDpnAZtLk'),
(33, 'emerre', 'maxiruiz@hotmai.com', '$2b$12$TEVrJ7CjhK2x83PInUEUcenJGMNF6WP3QKpAmUHTHT9FbkK56tgfq', 0, 'P4DNRZt4A-13AfEi5KYaFeib-H6a7AYhVmp_DCHwbc0');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_usuario_tipos`
--

CREATE TABLE `tbl_usuario_tipos` (
  `usuario_id` int(11) NOT NULL,
  `cod_tipo_usuario` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_usuario_tipos`
--

INSERT INTO `tbl_usuario_tipos` (`usuario_id`, `cod_tipo_usuario`) VALUES
(1, 'EST'),
(2, 'EST'),
(3, 'EST'),
(4, 'EST'),
(5, 'EST'),
(7, 'EST'),
(8, 'EST'),
(11, 'ADM'),
(12, 'EST'),
(13, 'ADM'),
(13, 'DOC'),
(14, 'EST'),
(15, 'EST'),
(16, 'EST'),
(17, 'EST'),
(18, 'ADM'),
(30, 'ADM'),
(31, 'EST'),
(32, 'EST');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tbl_asistencia`
--
ALTER TABLE `tbl_asistencia`
  ADD PRIMARY KEY (`id_inasistencia`),
  ADD KEY `entidad_id` (`entidad_id`),
  ADD KEY `materia_id` (`materia_id`),
  ADD KEY `tipo_asistencia_id` (`tipo_asistencia_id`),
  ADD KEY `idx_fecha_entidad` (`fecha`,`entidad_id`),
  ADD KEY `idx_curso_materia` (`curso_id`,`materia_id`);

--
-- Indices de la tabla `tbl_curso`
--
ALTER TABLE `tbl_curso`
  ADD PRIMARY KEY (`id_curso`),
  ADD KEY `idx_ciclo_lectivo` (`ciclo_lectivo`);

--
-- Indices de la tabla `tbl_entidad`
--
ALTER TABLE `tbl_entidad`
  ADD PRIMARY KEY (`id_entidad`),
  ADD KEY `fk_usuario_id` (`usuario_id`);

--
-- Indices de la tabla `tbl_inscripcion`
--
ALTER TABLE `tbl_inscripcion`
  ADD PRIMARY KEY (`id_inscripcion`),
  ADD KEY `entidad_id` (`entidad_id`),
  ADD KEY `materia_id` (`materia_id`),
  ADD KEY `tipo_inscripcion_id` (`tipo_inscripcion_id`),
  ADD KEY `idx_fecha_inscripcion` (`fecha_inscripcion`,`entidad_id`);

--
-- Indices de la tabla `tbl_materia`
--
ALTER TABLE `tbl_materia`
  ADD PRIMARY KEY (`id_materia`),
  ADD KEY `nombre_materia_id` (`nombre_materia_id`),
  ADD KEY `docente_id` (`docente_id`),
  ADD KEY `idx_curso_docente` (`curso_id`,`docente_id`);

--
-- Indices de la tabla `tbl_nombre_materia`
--
ALTER TABLE `tbl_nombre_materia`
  ADD PRIMARY KEY (`id_nombre_materia`);

--
-- Indices de la tabla `tbl_nota`
--
ALTER TABLE `tbl_nota`
  ADD PRIMARY KEY (`id_nota`),
  ADD KEY `alumno_id` (`alumno_id`),
  ADD KEY `tipo_nota_id` (`tipo_nota_id`),
  ADD KEY `usuario_carga_id` (`usuario_carga_id`),
  ADD KEY `idx_materia_alumno` (`materia_id`,`alumno_id`),
  ADD KEY `idx_fecha_carga` (`fecha_carga`);

--
-- Indices de la tabla `tbl_periodo`
--
ALTER TABLE `tbl_periodo`
  ADD PRIMARY KEY (`id_periodo`),
  ADD KEY `idx_fechas_periodo` (`fecha_inicio`,`fecha_fin`);

--
-- Indices de la tabla `tbl_tipo_actividad`
--
ALTER TABLE `tbl_tipo_actividad`
  ADD PRIMARY KEY (`cod_tipo_actividad`);

--
-- Indices de la tabla `tbl_tipo_asistencia`
--
ALTER TABLE `tbl_tipo_asistencia`
  ADD PRIMARY KEY (`id_tipo_asistencia`);

--
-- Indices de la tabla `tbl_tipo_entidad`
--
ALTER TABLE `tbl_tipo_entidad`
  ADD PRIMARY KEY (`cod_tipo_entidad`);

--
-- Indices de la tabla `tbl_tipo_inscripcion`
--
ALTER TABLE `tbl_tipo_inscripcion`
  ADD PRIMARY KEY (`id_tipo_inscripcion`);

--
-- Indices de la tabla `tbl_tipo_nota`
--
ALTER TABLE `tbl_tipo_nota`
  ADD PRIMARY KEY (`id_tipo_nota`),
  ADD KEY `periodo_id` (`periodo_id`),
  ADD KEY `idx_actividad_periodo` (`actividad_id`,`periodo_id`);

--
-- Indices de la tabla `tbl_tipo_usuario`
--
ALTER TABLE `tbl_tipo_usuario`
  ADD PRIMARY KEY (`cod_tipo_usuario`);

--
-- Indices de la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_password` (`password`);

--
-- Indices de la tabla `tbl_usuario_tipos`
--
ALTER TABLE `tbl_usuario_tipos`
  ADD PRIMARY KEY (`usuario_id`,`cod_tipo_usuario`),
  ADD KEY `cod_tipo_usuario` (`cod_tipo_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tbl_asistencia`
--
ALTER TABLE `tbl_asistencia`
  MODIFY `id_inasistencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_curso`
--
ALTER TABLE `tbl_curso`
  MODIFY `id_curso` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_entidad`
--
ALTER TABLE `tbl_entidad`
  MODIFY `id_entidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_inscripcion`
--
ALTER TABLE `tbl_inscripcion`
  MODIFY `id_inscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_materia`
--
ALTER TABLE `tbl_materia`
  MODIFY `id_materia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_nombre_materia`
--
ALTER TABLE `tbl_nombre_materia`
  MODIFY `id_nombre_materia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_nota`
--
ALTER TABLE `tbl_nota`
  MODIFY `id_nota` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_periodo`
--
ALTER TABLE `tbl_periodo`
  MODIFY `id_periodo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_actividad`
--
ALTER TABLE `tbl_tipo_actividad`
  MODIFY `cod_tipo_actividad` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_asistencia`
--
ALTER TABLE `tbl_tipo_asistencia`
  MODIFY `id_tipo_asistencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_inscripcion`
--
ALTER TABLE `tbl_tipo_inscripcion`
  MODIFY `id_tipo_inscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_nota`
--
ALTER TABLE `tbl_tipo_nota`
  MODIFY `id_tipo_nota` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tbl_asistencia`
--
ALTER TABLE `tbl_asistencia`
  ADD CONSTRAINT `tbl_asistencia_ibfk_1` FOREIGN KEY (`entidad_id`) REFERENCES `tbl_entidad` (`id_entidad`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_asistencia_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `tbl_curso` (`id_curso`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_asistencia_ibfk_3` FOREIGN KEY (`materia_id`) REFERENCES `tbl_materia` (`id_materia`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_asistencia_ibfk_4` FOREIGN KEY (`tipo_asistencia_id`) REFERENCES `tbl_tipo_asistencia` (`id_tipo_asistencia`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `tbl_entidad`
--
ALTER TABLE `tbl_entidad`
  ADD CONSTRAINT `fk_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`id`);

--
-- Filtros para la tabla `tbl_inscripcion`
--
ALTER TABLE `tbl_inscripcion`
  ADD CONSTRAINT `tbl_inscripcion_ibfk_1` FOREIGN KEY (`entidad_id`) REFERENCES `tbl_entidad` (`id_entidad`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_inscripcion_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `tbl_materia` (`id_materia`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_inscripcion_ibfk_3` FOREIGN KEY (`tipo_inscripcion_id`) REFERENCES `tbl_tipo_inscripcion` (`id_tipo_inscripcion`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `tbl_materia`
--
ALTER TABLE `tbl_materia`
  ADD CONSTRAINT `tbl_materia_ibfk_1` FOREIGN KEY (`nombre_materia_id`) REFERENCES `tbl_nombre_materia` (`id_nombre_materia`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_materia_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `tbl_curso` (`id_curso`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_materia_ibfk_3` FOREIGN KEY (`docente_id`) REFERENCES `tbl_entidad` (`id_entidad`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `tbl_nota`
--
ALTER TABLE `tbl_nota`
  ADD CONSTRAINT `tbl_nota_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `tbl_materia` (`id_materia`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_nota_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `tbl_entidad` (`id_entidad`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_nota_ibfk_3` FOREIGN KEY (`tipo_nota_id`) REFERENCES `tbl_tipo_nota` (`id_tipo_nota`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_nota_ibfk_4` FOREIGN KEY (`usuario_carga_id`) REFERENCES `tbl_entidad` (`id_entidad`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `tbl_tipo_nota`
--
ALTER TABLE `tbl_tipo_nota`
  ADD CONSTRAINT `tbl_tipo_nota_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `tbl_tipo_actividad` (`cod_tipo_actividad`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tbl_tipo_nota_ibfk_2` FOREIGN KEY (`periodo_id`) REFERENCES `tbl_periodo` (`id_periodo`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `tbl_usuario_tipos`
--
ALTER TABLE `tbl_usuario_tipos`
  ADD CONSTRAINT `tbl_usuario_tipos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`id`),
  ADD CONSTRAINT `tbl_usuario_tipos_ibfk_2` FOREIGN KEY (`cod_tipo_usuario`) REFERENCES `tbl_tipo_usuario` (`cod_tipo_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
