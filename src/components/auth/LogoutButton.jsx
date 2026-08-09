export default function LogoutButton({ onLogout }) {
  if (!onLogout) return null
  return (
    <button type="button" className="auth-logout" onClick={onLogout}>
      Log Out
    </button>
  )
}
