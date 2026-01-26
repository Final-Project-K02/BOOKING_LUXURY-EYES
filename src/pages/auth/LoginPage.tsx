// import { Button, Card, Form, Input, message } from "antd";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../../api";
// import { useDispatch } from "react-redux";
// import { setAuth } from "../../app/features/authSlice";
// import type { LoginPayload } from "../../types/User";

// const LoginPage = () => {
//   const nav = useNavigate();
//   const dispatch = useDispatch();
//   const onFinish = async (values: LoginPayload) => {
//     try {
//       const res = await api.post("/auth/login", {
//         email: values.email,
//         password: values.password,
//       });

//       if (!res.data.success) {
//         message.error("Sai email hoặc mật khẩu!");
//         return;
//       }

//       const { user, accessToken } = res.data.data;
//       dispatch(setAuth({ user, accessToken }));

//       localStorage.setItem("accessToken", res.data.data.accessToken);
//       localStorage.setItem("user", JSON.stringify(res.data.data.user));

//       if (res.data.data.user.role === "admin") {
//         nav("/admin/dashboard");
//       } else {
//         nav("/");
//       }

//       message.success("Đăng nhập thành công!");
//     } catch (err) {
//       console.log(err);
//       message.error("Đăng nhập thất bại!");
//     }
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         minHeight: "100vh",
//         justifyContent: "center",
//         alignItems: "center",
//         background: "#eef1f6",
//       }}
//     >
//       <Card style={{ width: 400, padding: 30 }}>
//         <h2 style={{ textAlign: "center", marginBottom: 20 }}>Đăng nhập</h2>

//         <Form layout="vertical" onFinish={onFinish}>
//           <Form.Item label="Email" name="email" rules={[{ required: true }]}>
//             <Input type="email" placeholder="Nhập email" />
//           </Form.Item>

//           <Form.Item
//             label="Mật khẩu"
//             name="password"
//             rules={[{ required: true }]}
//           >
//             <Input.Password placeholder="Nhập mật khẩu" />
//           </Form.Item>

//           <Button type="primary" htmlType="submit" block size="large">
//             Đăng nhập
//           </Button>

//           <Button block size="large" style={{ marginTop: 12 }}>
//             <Link to="/" style={{ display: "block" }}>
//               Quay về trang chủ
//             </Link>
//           </Button>
//         </Form>

//         <div style={{ textAlign: "center", marginTop: 20 }}>
//           Chưa có tài khoản? <Link to="/auth/register">Đăng ký</Link>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default LoginPage;
