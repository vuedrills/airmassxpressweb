import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../bloc/profile/profile_bloc.dart';
import '../../bloc/profile/profile_event.dart';
import '../../bloc/profile/profile_state.dart';
import '../../config/theme.dart';
import '../../core/service_locator.dart';
import '../../core/validators.dart';

/// Edit profile screen - update name, bio, skills
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _bioController;
  List<String> _skills = [];
  final TextEditingController _skillController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    _skillController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ProfileBloc>()..add(LoadProfile()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Edit Profile'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: BlocConsumer<ProfileBloc, ProfileState>(
          listener: (context, state) {
            if (state is ProfileUpdated) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Profile updated successfully')),
              );
              context.pop();
            } else if (state is ProfileError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error: ${state.message}')),
              );
            }
          },
          builder: (context, state) {
            if (state is ProfileLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is ProfileLoaded) {
              // Initialize controllers with profile data
              _nameController = TextEditingController(text: state.profile.name);
              _bioController = TextEditingController(text: state.profile.bio ?? '');
              _skills = List.from(state.profile.skills);

              return _buildForm(context, state);
            }

            return const Center(child: CircularProgressIndicator());
          },
        ),
      ),
    );
  }

  Widget _buildForm(BuildContext context, ProfileLoaded state) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Avatar section
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundImage: state.profile.profileImage != null
                        ? NetworkImage(state.profile.profileImage!)
                        : null,
                    child: state.profile.profileImage == null
                        ? Text(
                            state.profile.name[0],
                            style: const TextStyle(fontSize: 36),
                          )
                        : null,
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: GestureDetector(
                      onTap: () {
                        // TODO: Image picker
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Image upload coming soon')),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: AppTheme.primaryBlue,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          size: 20,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Name field
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name',
                hintText: 'Enter your full name',
                prefixIcon: Icon(Icons.person_outline),
              ),
              validator: Validators.name,
            ),

            const SizedBox(height: 20),

            // Bio field
            TextFormField(
              controller: _bioController,
              decoration: const InputDecoration(
                labelText: 'Bio',
                hintText: 'Tell us about yourself',
                prefixIcon: Icon(Icons.article_outlined),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              maxLength: 200,
            ),

            const SizedBox(height: 20),

            // Skills section
            Text(
              'Skills',
              style: Theme.of(context).textTheme.titleMedium!.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),

            const SizedBox(height: 12),

            // Skills chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ..._skills.map((skill) => Chip(
                      label: Text(skill),
                      deleteIcon: const Icon(Icons.close, size: 18),
                      onDeleted: () {
                        setState(() {
                          _skills.remove(skill);
                        });
                      },
                    )),
              ],
            ),

            const SizedBox(height: 12),

            // Add skill field
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _skillController,
                    decoration: const InputDecoration(
                      hintText: 'Add a skill',
                      prefixIcon: Icon(Icons.add),
                    ),
                    onSubmitted: (value) => _addSkill(value),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.add_circle, color: AppTheme.primaryBlue),
                  onPressed: () => _addSkill(_skillController.text),
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Save button
            ElevatedButton(
              onPressed: () => _saveProfile(context, state),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }

  void _addSkill(String skill) {
    if (skill.trim().isNotEmpty && !_skills.contains(skill.trim())) {
      setState(() {
        _skills.add(skill.trim());
        _skillController.clear();
      });
    }
  }

  void _saveProfile(BuildContext context, ProfileLoaded state) {
    if (_formKey.currentState!.validate()) {
      final updatedProfile = state.profile.copyWith(
        name: _nameController.text.trim(),
        bio: _bioController.text.trim(),
        skills: _skills,
      );

      context.read<ProfileBloc>().add(UpdateProfile(updatedProfile));
    }
  }
}
