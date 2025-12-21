import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';
import 'package:mobile/features/auction/presentation/providers/category_provider.dart';
import 'package:mobile/features/auction/presentation/providers/town_provider.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';

class CreateAuctionScreen extends ConsumerStatefulWidget {
  const CreateAuctionScreen({super.key});

  @override
  ConsumerState<CreateAuctionScreen> createState() => _CreateAuctionScreenState();
}

class _CreateAuctionScreenState extends ConsumerState<CreateAuctionScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isSubmitting = false;

  // Data Controllers
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController(); // We'll keep this for the slider value tracking if needed or text input
  double _currentPrice = 10.0;

  // Selections
  List<XFile> _selectedImages = [];
  int? _selectedCategoryId;
  int? _selectedTownId;

  // Image Picker
  final ImagePicker _picker = ImagePicker();

  @override
  void dispose() {
    _pageController.dispose();
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 2) {
      if (_validateStep(_currentStep)) {
        HapticFeedback.lightImpact();
        _pageController.nextPage(
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOutQuart,
        );
        setState(() => _currentStep++);
      }
    } else {
      _submit();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      HapticFeedback.lightImpact();
      _pageController.previousPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOutQuart,
      );
      setState(() => _currentStep--);
    }
  }

  bool _validateStep(int step) {
    if (step == 0) {
      if (_selectedImages.isEmpty) {
        _showError("Showcase your item with at least one photo.");
        return false;
      }
      return true;
    } else if (step == 1) {
      if (_titleController.text.trim().isEmpty) {
        _showError("Please give your item a title.");
        return false;
      }
       if (_descriptionController.text.trim().isEmpty) {
        _showError("Tell us a bit about the item.");
        return false;
      }
      if (_selectedCategoryId == null) {
        _showError("Select a category.");
        return false;
      }
      if (_selectedTownId == null) {
        _showError("Select your town.");
        return false;
      }
      return true;
    }
    return true;
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: Colors.red[800],
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Future<void> _pickImages() async {
    try {
      final List<XFile> images = await _picker.pickMultiImage(maxWidth: 1200, imageQuality: 85);
      if (images.isNotEmpty) {
        setState(() {
          _selectedImages = [..._selectedImages, ...images].take(5).toList();
        });
      }
    } catch (e) {
      _showError("Failed to pick images");
    }
  }

  Future<String?> _uploadImage(File imageFile) async {
    try {
      final response = await http.MultipartRequest(
        'POST',
        Uri.parse('http://127.0.0.1:8080/upload'),
      );
      final authState = ref.read(authProvider);
      if (authState.token != null) {
        response.headers['Authorization'] = 'Bearer ${authState.token}';
      }
      response.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
      
      final streamed = await response.send();
      if (streamed.statusCode == 200) {
        final respStr = await streamed.stream.bytesToString();
        return json.decode(respStr)['url'];
      }
    } catch (e) {
      debugPrint("Upload error: $e");
    }
    return null;
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    try {
      // 1. Upload Images
      List<String> imageUrls = [];
      for (var img in _selectedImages) {
        final url = await _uploadImage(File(img.path));
        if (url != null) imageUrls.add(url);
      }
      if (imageUrls.isEmpty) {
        imageUrls.add("https://images.unsplash.com/photo-1550989460-0adf9ea622e2"); 
      }

      // 2. Create Auction
      final repo = ref.read(auctionRepositoryProvider);
      await repo.createAuction({
        "CategoryID": _selectedCategoryId,
        "TownID": _selectedTownId,
        "Title": _titleController.text.trim(),
        "Description": _descriptionController.text.trim(),
        "StartPrice": _currentPrice,
        "Scope": "town",
        "Images": imageUrls,
      });

      if (mounted) {
        ref.invalidate(auctionListProvider);
        context.pop();
        // Here we would ideally show a confetti dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("🚀 Auction Live! Good luck!", style: GoogleFonts.outfit()),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) _showError("Failed to create auction: $e");
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                   _buildStepOnePhotos(),
                   _buildStepTwoDetails(),
                   _buildStepThreePrice(),
                ],
              ),
            ),
            _buildBottomBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => context.pop(),
            style: IconButton.styleFrom(backgroundColor: Colors.grey[100]),
          ),
          const Spacer(),
          Text(
            "Step ${_currentStep + 1} of 3",
            style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: Colors.grey[500]),
          ),
          const SizedBox(width: 8),
          Container(
            width: 60,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(2),
            ),
            child: Row(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 20.0 * (_currentStep + 1),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey[100]!)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (_currentStep > 0)
            TextButton(
              onPressed: _prevStep,
              child: Text("Back", style: GoogleFonts.outfit(color: Colors.grey[600], fontSize: 16)),
            )
          else
            const SizedBox(width: 60),

          ElevatedButton(
            onPressed: _isSubmitting ? null : _nextStep,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
              elevation: 0,
            ),
            child: _isSubmitting 
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text(
                  _currentStep == 2 ? "GO LIVE 🚀" : "Next Step",
                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
                ),
          ),
        ],
      ),
    );
  }

  // --- STEPS ---

  // STEP 1: PHOTOS
  Widget _buildStepOnePhotos() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Showcase your item", style: GoogleFonts.ebGaramond(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.black)),
          const SizedBox(height: 8),
          Text("Great photos act like a magnet for bids.", style: GoogleFonts.inter(fontSize: 16, color: Colors.grey[600])),
          const SizedBox(height: 32),
          
          Expanded(
            child: _selectedImages.isEmpty 
              ? _buildEmptyPhotoState()
              : GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                     crossAxisCount: 2, crossAxisSpacing: 16, mainAxisSpacing: 16,
                  ),
                  itemCount: _selectedImages.length + 1,
                  itemBuilder: (context, index) {
                    if (index == _selectedImages.length) {
                      return _buildAddPhotoButton();
                    }
                    return Stack(
                      fit: StackFit.expand,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: Image.file(File(_selectedImages[index].path), fit: BoxFit.cover),
                        ),
                        Positioned(
                          top: 8, right: 8,
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedImages.removeAt(index)),
                            child: const CircleAvatar(radius: 12, backgroundColor: Colors.white, child: Icon(Icons.close, size: 16, color: Colors.black)),
                          ),
                        )
                      ],
                    );
                  },
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyPhotoState() {
    // Return a LayoutBuilder to ensure size context is utilized properly if needed, although Expanded covers it.
    // Making sure it has a concrete height if parent constraints are loose, but Expanded provides tight constraints.
    return GestureDetector(
      onTap: _pickImages,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.grey[50], 
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.grey[300]!, width: 2),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_a_photo_outlined, size: 48, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text("Tap to upload photos", style: GoogleFonts.ebGaramond(fontSize: 20, fontWeight: FontWeight.w600, color: Colors.black)),
          ],
        ),
      ),
    );
  }

  Widget _buildAddPhotoButton() {
    return GestureDetector(
      onTap: _pickImages,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey[100], 
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Icon(Icons.add, size: 32),
      ),
    );
  }

  // STEP 2: DETAILS
  Widget _buildStepTwoDetails() {
    final categoriesAsync = ref.watch(categoryListProvider);
    final townsAsync = ref.watch(townListProvider);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      children: [
        Text("The essentials", style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        
        // Title
        TextField(
          controller: _titleController,
          style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w500),
          decoration: const InputDecoration(
            hintText: "What are you selling?",
            border: InputBorder.none,
          ),
        ),
        const Divider(),
        
        // Description
        TextField(
          controller: _descriptionController,
          maxLines: 4,
          style: GoogleFonts.inter(fontSize: 16),
          decoration: InputDecoration(
            hintText: "Describe the condition, features, and history...",
            hintStyle: TextStyle(color: Colors.grey[400]),
            border: InputBorder.none,
          ),
        ),
        const SizedBox(height: 32),

        // Category Grid
        Text("Category", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        categoriesAsync.when(
          data: (cats) => Wrap(
            spacing: 12,
            runSpacing: 12,
            children: cats.map((c) => _buildChoiceChip(
              label: c.name,
              selected: _selectedCategoryId == c.id,
              onSelected: (sel) => setState(() => _selectedCategoryId = sel ? c.id : null),
            )).toList(),
          ),
          loading: () => const LinearProgressIndicator(),
          error: (_,__) => const Text("Failed to load categories"),
        ),
        
        const SizedBox(height: 32),
        // Town
        Text("Location", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        townsAsync.when(
          data: (towns) => Wrap(
            spacing: 12,
            runSpacing: 12,
            children: towns.map((t) => _buildChoiceChip(
              label: t.name,
              selected: _selectedTownId == t.id,
              onSelected: (sel) => setState(() => _selectedTownId = sel ? t.id : null),
            )).toList(),
          ),
          loading: () => const SizedBox(),
          error: (_,__) => const SizedBox(),
        ),
      ],
    );
  }

  Widget _buildChoiceChip({required String label, required bool selected, required Function(bool) onSelected}) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: onSelected,
      labelStyle: GoogleFonts.inter(
        color: selected ? Colors.white : Colors.black,
        fontWeight: FontWeight.w600,
      ),
      backgroundColor: Colors.white,
      selectedColor: Colors.black,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: selected ? Colors.transparent : Colors.grey[300]!),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      showCheckmark: false,
    );
  }

  // STEP 3: PRICE
  Widget _buildStepThreePrice() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text("Starting Price", style: GoogleFonts.outfit(fontSize: 24, color: Colors.grey[600])),
          const SizedBox(height: 32),
          
          Text(
            "\$${_currentPrice.toStringAsFixed(0)}", 
            style: GoogleFonts.outfit(fontSize: 80, fontWeight: FontWeight.bold),
          ),
          
          const SizedBox(height: 48),
          
          // Slider
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
               activeTrackColor: Colors.black,
               thumbColor: Colors.black,
               overlayColor: Colors.black12,
               trackHeight: 16,
               thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 16),
            ),
            child: Slider(
              value: _currentPrice,
              min: 0,
              max: 1000,
              divisions: 200,
              onChanged: (val) {
                HapticFeedback.selectionClick();
                setState(() => _currentPrice = val);
              },
            ),
          ),
          const SizedBox(height: 16),
          Text("Slide to adjust price", style: GoogleFonts.inter(color: Colors.grey)),
        ],
      ),
    );
  }
}
