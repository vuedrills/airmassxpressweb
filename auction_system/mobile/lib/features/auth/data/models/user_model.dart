import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class User {
  final int id;
  @JsonKey(name: 'username')
  final String username;
  @JsonKey(name: 'email')
  final String email;
  @JsonKey(name: 'town_id')
  final int? townId;
  @JsonKey(name: 'role')
  final String role;
  @JsonKey(name: 'is_verified')
  final bool isVerified;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.townId,
    required this.role,
    this.isVerified = false,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
