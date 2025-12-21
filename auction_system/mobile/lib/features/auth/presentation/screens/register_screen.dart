import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile/features/auction/presentation/providers/town_provider.dart'; // Add this import
import 'package:mobile/features/auction/presentation/widgets/town_selector.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  int? _selectedTownId;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedTownId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select your home town')),
        );
        return;
      }

      await ref.read(authProvider.notifier).register(
        _usernameController.text.trim(),
        _emailController.text.trim(),
        _passwordController.text.trim(),
        _selectedTownId!,
      );

      final authState = ref.read(authProvider);
      if (authState.user != null) {
        if (mounted) context.go('/');
      } else if (authState.error != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(authState.error!), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final townsAsync = ref.watch(townListProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Create Account"),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                "Welcome to AirMass",
                style: theme.textTheme.displayMedium,
              ),
              const SizedBox(height: 8),
              Text(
                "The premium marketplace for unique finds and local treasures.",
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 40),
              
              // Username
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Username required' : null,
              ),
              const SizedBox(height: 16),

              // Email
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) => value == null || !value.contains('@') ? 'Enter a valid email' : null,
              ),
              const SizedBox(height: 16),

              // Password
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock_outline),
                ),
                validator: (value) => value == null || value.length < 6 ? 'Minimum 6 characters' : null,
              ),
              const SizedBox(height: 16),

              // Town Selector
              townsAsync.when(
                data: (towns) => DropdownButtonFormField<int>(
                  value: _selectedTownId,
                  decoration: const InputDecoration(
                    labelText: 'Home Town',
                    prefixIcon: Icon(Icons.location_on_outlined),
                  ),
                  items: towns.map((town) {
                    return DropdownMenuItem<int>(
                      value: town.id,
                      child: Text(town.name),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedTownId = val),
                  validator: (value) => value == null ? 'Select your home town' : null,
                ),
                loading: () => const LinearProgressIndicator(),
                error: (_, __) => const Text("Error loading towns"),
              ),
              const SizedBox(height: 40),

              // Register Button
              ElevatedButton(
                onPressed: authState.isLoading ? null : _register,
                child: authState.isLoading 
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text("GET STARTED"),
              ),

              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Already a member? ", style: theme.textTheme.bodyMedium),
                  GestureDetector(
                    onTap: () => context.push('/login'),
                    child: Text(
                      "Sign In",
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
