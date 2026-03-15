import AdminLoginForm from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="text-2xl font-bold text-gray-900">后台登录</h1>
      <p className="mt-2 text-sm text-muted">默认管理员账号：admin，默认密码：adm12312</p>
      <AdminLoginForm />
    </div>
  );
}
