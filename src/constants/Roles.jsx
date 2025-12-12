// AcademIA/src/constants/roles.js

/**
 * 🚨 DEFINICIÓN DE ROLES DEL SISTEMA 🚨
 * Los valores deben coincidir *exactamente* con los códigos de rol
 * que devuelve el backend (cod_tipo_usuario).
 */
export const ROL_ADMIN = 'ADMIN_SISTEMA';
export const ROL_ALUMNO = 'ALUMNO_APP';
export const ROL_DOCENTE = 'DOCENTE_APP';

// Opcional: Lista de todos los roles (útil para validaciones futuras)
export const ALL_ROLES = [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE];