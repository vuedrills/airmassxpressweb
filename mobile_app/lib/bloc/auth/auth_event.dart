

abstract class AuthEvent {}

class AuthLoadUser extends AuthEvent {}

class AuthLogin extends AuthEvent {
  final String email;
  final String password;

  AuthLogin({required this.email, required this.password});
}

class AuthRegister extends AuthEvent {
  final String name;
  final String email;
  final String password;

  AuthRegister({required this.name, required this.email, required this.password});
}

class AuthLogout extends AuthEvent {}
