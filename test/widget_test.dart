// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:progetto_on_stage_bari/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const OnStageBariApp());

    // Verify that Home screen is displayed.
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Mappa'), findsNothing);

    // Tap on 'Mappa' in the bottom bar.
    await tester.tap(find.byIcon(Icons.map_outlined));
    await tester.pump();

    // Verify that Mappa screen is displayed.
    expect(find.text('Mappa'), findsOneWidget);
  });
}
