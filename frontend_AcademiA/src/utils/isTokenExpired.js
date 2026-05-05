//  frontend_AcademiA\src\utils\isTokenExpired.js
//  Valida token vencido

export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

