// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: (json['id'] as num).toInt(),
  username: json['username'] as String,
  email: json['email'] as String,
  townId: (json['town_id'] as num?)?.toInt(),
  role: json['role'] as String,
  isVerified: json['is_verified'] as bool? ?? false,
  avatarUrl: json['avatar_url'] as String?,
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  'id': instance.id,
  'username': instance.username,
  'email': instance.email,
  'town_id': instance.townId,
  'role': instance.role,
  'is_verified': instance.isVerified,
  'avatar_url': instance.avatarUrl,
};
