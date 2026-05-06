import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

void main() {
  runApp(const OnStageBariApp());
}

class OnStageBariApp extends StatelessWidget {
  const OnStageBariApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OnStage Bari',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        // Colore di sfondo: Giallo pastello chiaro
        scaffoldBackgroundColor: const Color(0xFFFFF9E6),
        // Colore primario: Arancione Vivace
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF7F50),
          primary: const Color(0xFFFF7F50),
          onPrimary: Colors.white,
          surface: const Color(0xFFFFF9E6),
        ),
        // Colore testo: Grigio Antracite
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Color(0xFF333333)),
          bodyMedium: TextStyle(color: Color(0xFF333333)),
          displayLarge: TextStyle(color: Color(0xFF333333), fontWeight: FontWeight.bold),
        ),
        // Bottoni: Forma a pillola, senza ombre eccessive
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFF7F50),
            foregroundColor: Colors.white,
            elevation: 2,
            shape: const StadiumBorder(), // Forma a pillola
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          ),
        ),
        // Personalizzazione BottomNavigationBar
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: Color(0xFFFF7F50),
          unselectedItemColor: Colors.grey,
          type: BottomNavigationBarType.fixed,
        ),
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const PlaceholderScreen(title: 'Home', icon: Icons.home_rounded),
    const MapScreen(),
    const PlaceholderScreen(title: 'Missioni', icon: Icons.explore_rounded),
    const PlaceholderScreen(title: 'Profilo', icon: Icons.person_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map_outlined),
            activeIcon: Icon(Icons.map),
            label: 'Mappa',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Missioni',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profilo',
          ),
        ],
      ),
    );
  }
}

class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Livello Sfondo (Mappa reale)
        FlutterMap(
          options: const MapOptions(
            initialCenter: LatLng(41.1219, 16.8732), // Centro di Bari / Petruzzelli
            initialZoom: 16,
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.example.app',
            ),
            const MarkerLayer(
              markers: [
                Marker(
                  point: LatLng(41.1219, 16.8732),
                  width: 50,
                  height: 50,
                  child: Icon(
                    Icons.theater_comedy_rounded,
                    size: 50,
                    color: Color(0xFFFF6F61), // Rosso corallo
                  ),
                ),
              ],
            ),
          ],
        ),

        // Livello in primo piano (Card Missione)
        Align(
          alignment: Alignment.bottomCenter,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(40),
                topRight: Radius.circular(40),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 15,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Titolo Missione
                const Text(
                  'MISSIONE PETRUZZELLI',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFFF7F50), // Arancione
                  ),
                ),
                const SizedBox(height: 8),
                // Sottotitolo
                const Text(
                  'VAI AL TEATRO E SBLOCCA IL GIOCO!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF666666),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 24),
                // Icone centrali in cerchi gialli
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildMissionIcon(Icons.location_on),
                    _buildMissionIcon(Icons.headphones),
                    _buildMissionIcon(Icons.lightbulb),
                    _buildMissionIcon(Icons.shield),
                  ],
                ),
                const SizedBox(height: 32),
                // Bottone "Inizia Ora" con effetto 3D
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0xFFD35400), // Ombra arancione scura (3D)
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const QuizPetruzzelliScreen(),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF7F50),
                        foregroundColor: Colors.white,
                        elevation: 0, // Gestita dal box decoration sotto
                        shape: const StadiumBorder(),
                      ),
                      child: const Text(
                        'INIZIA ORA! ▶',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMissionIcon(IconData icon) {
    return Container(
      width: 50,
      height: 50,
      decoration: const BoxDecoration(
        color: Color(0xFFFFF9E6), // Giallo pastello
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: const Color(0xFFFF7F50), size: 28),
    );
  }
}

class PlaceholderScreen extends StatelessWidget {
  final String title;
  final IconData icon;

  const PlaceholderScreen({
    super.key,
    required this.title,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Theme.of(context).primaryColor),
          const SizedBox(height: 16),
          Text(
            title,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: const Color(0xFF333333),
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {},
            child: Text('Azione $title'),
          ),
        ],
      ),
    );
  }
}

class QuizPetruzzelliScreen extends StatelessWidget {
  const QuizPetruzzelliScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF9E6),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: const BackButton(color: Color(0xFF333333)),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                '🎭',
                style: TextStyle(fontSize: 80),
              ),
              const SizedBox(height: 40),
              const Text(
                'In che anno è stato inaugurato il Teatro Petruzzelli?',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF333333),
                ),
              ),
              const SizedBox(height: 48),
              _buildQuizButton(context, '1903'),
              const SizedBox(height: 20),
              _buildQuizButton(context, '1850'),
              const SizedBox(height: 20),
              _buildQuizButton(context, '1950'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuizButton(BuildContext context, String label) {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(30),
          boxShadow: const [
            BoxShadow(
              color: Color(0xFFD35400), // Ombra arancione scura (3D)
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: () {
            // Logica per la risposta (opzionale per ora)
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFF7F50),
            foregroundColor: Colors.white,
            elevation: 0,
            shape: const StadiumBorder(),
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
