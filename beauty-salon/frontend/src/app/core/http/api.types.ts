/**
 * Envoltorio estándar para respuestas de entidad única.
 * Cuando el backend exista, todas las GET /api/v1/{resource}/:id
 * devolverán { data: T }.
 */
export interface ApiResponse<T> {
  readonly data: T;
}

/**
 * Envoltorio estándar para respuestas paginadas.
 * Cada endpoint de lista devolverá { data: T[], metadata: { total, page, limit } }
 * permitiendo que el frontend sepa cuántos items existen sin cargarlos todos.
 */
export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly metadata: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
  };
}

/**
 * Representación uniforme de un error de API.
 * Los repositorios usarán esto en lugar de boolean o strings inconsistentes.
 */
export interface ApiError {
  readonly status: number;
  readonly message: string;
  readonly label: string;
}
