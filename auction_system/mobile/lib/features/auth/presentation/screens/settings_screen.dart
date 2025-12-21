import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _pushNotifications = true;
  bool _emailNotifications = false;
  bool _darkMode = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: Text(
          "Settings",
          style: GoogleFonts.outfit(
            color: Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: ListView(
        children: [
          const SizedBox(height: 12),
          _buildSectionHeader("Notifications"),
          _buildSwitchTile(
            title: "Push Notifications",
            subtitle: "Outbid alerts, won auctions, etc.",
            value: _pushNotifications,
            onChanged: (v) => setState(() => _pushNotifications = v),
            icon: Icons.notifications_active_outlined,
          ),
          _buildSwitchTile(
            title: "Email Notifications",
            subtitle: "Weekly summaries and news",
            value: _emailNotifications,
            onChanged: (v) => setState(() => _emailNotifications = v),
            icon: Icons.email_outlined,
          ),
          
          const SizedBox(height: 24),
          _buildSectionHeader("Appearance"),
          _buildSwitchTile(
            title: "Dark Mode",
            subtitle: "Switch between light and dark theme",
            value: _darkMode,
            onChanged: (v) => setState(() => _darkMode = v),
            icon: Icons.dark_mode_outlined,
          ),

          const SizedBox(height: 24),
          _buildSectionHeader("Account & Storage"),
          _buildLinkTile(
            title: "Privacy Policy",
            icon: Icons.privacy_tip_outlined,
            onTap: () {},
          ),
          _buildLinkTile(
            title: "Terms of Service",
            icon: Icons.description_outlined,
            onTap: () {},
          ),
          _buildLinkTile(
            title: "Clear Cache",
            icon: Icons.delete_outline,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cache cleared')),
              );
            },
          ),

          const SizedBox(height: 24),
          _buildSectionHeader("About"),
          _buildLinkTile(
            title: "App Version",
            subtitle: "1.0.0 (Build 12)",
            icon: Icons.info_outline,
            onTap: null,
          ),
          
          const SizedBox(height: 48),
          Center(
            child: Text(
              "Made with ❤️ in Zimbabwe",
              style: GoogleFonts.inter(
                fontSize: 12,
                color: Colors.grey[500],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Text(
        title.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.grey[500],
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required IconData icon,
  }) {
    return Container(
      color: Colors.white,
      child: ListTile(
        leading: Icon(icon, color: Colors.black87),
        title: Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
        subtitle: Text(subtitle, style: GoogleFonts.inter(fontSize: 12)),
        trailing: Switch.adaptive(
          value: value,
          onChanged: onChanged,
          activeColor: Colors.black,
        ),
      ),
    );
  }

  Widget _buildLinkTile({
    required String title,
    String? subtitle,
    required IconData icon,
    required VoidCallback? onTap,
  }) {
    return Container(
      color: Colors.white,
      child: ListTile(
        leading: Icon(icon, color: Colors.black87),
        title: Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
        subtitle: subtitle != null ? Text(subtitle, style: GoogleFonts.inter(fontSize: 12)) : null,
        trailing: onTap != null ? const Icon(Icons.chevron_right, size: 20) : null,
        onTap: onTap,
      ),
    );
  }
}
