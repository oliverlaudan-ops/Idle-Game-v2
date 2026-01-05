# 🚀 Space Colonies - Idle Game

Ein progressives Idle/Incremental-Game über den Aufbau einer Weltraumkolonie.

## 🎮 Spiel jetzt!

**Live Demo:** [idle.future-pulse.tech](https://idle.future-pulse.tech/)

## 🎯 Spielkonzept

Baue und verwalte deine eigene Weltraumkolonie! Sammle Ressourcen, errichte Gebäude, erforsche neue Technologien und erweitere deine Kolonie Schritt für Schritt zu einer blühenden Zivilisation.

### Kern-Features

- 💧 **9 Ressourcen-Typen**: Energie, Wasser, Nahrung, Bevölkerung, Gestein, Metall, Kristalle, Treibstoff und Forschung
- 🏭 **20+ Gebäude**: Von einfachen Solarpanels bis zu fortgeschrittenen Fusionsreaktoren
- 🔬 **30+ Forschungen**: Drei Technologie-Tiers zum Freischalten
- 🏆 **40+ Achievements**: Sammel Erfolge und schalte Belohnungen frei
- 🌟 **Prestige-System**: Reset mit permanenten Boni für schnelleren Fortschritt
- 📦 **Bauplatz-Management**: Strategisch planen mit begrenzten Bauplätzen (10-85)
- 💥 **Demolish-Feature**: Gebäude abreißen mit 50% Rückerstattung
- 💾 **Auto-Save**: Automatisches Speichern im LocalStorage

## 🕹️ Gameplay-Phasen

### Phase 1: Frühe Kolonie
- Klicke um Energie zu sammeln
- Baue erste Solarpanels und Wassersammler
- Starte die Nahrungsproduktion
- Wachse langsam zu einer kleinen Gemeinschaft

### Phase 2: Industrialisierung
- Fördere Gestein und produziere Metall
- Baue Raffinerien und Minen
- Erweitere deine Bauplätze
- Starte die Forschung

### Phase 3: Hochtechnologie
- Entdecke seltene Kristalle
- Produziere Raketentreibstoff
- Erforssche fortgeschrittene Technologien
- Baue Fusionsreaktoren und Quantencomputer

### Phase 4: Prestige & Expansion
- Führe deinen ersten Prestige durch
- Schalte permanente Upgrades frei
- Erreiche 100+ Kolonisten
- Baue die ultimative Mega-Kolonie (85 Bauplätze!)

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS mit Custom Properties
- **State Management**: LocalStorage Persistence
- **Architecture**: Modulares Design mit ES6 Modules

### Projekt-Struktur

```
Idle-Game-v2/
├── index.html              # Haupt-HTML
├── styles.css             # Alle Styles
├── main.js                # Entry Point
├── src/
│   ├── modules/
│   │   ├── core.js            # Kern-Game-Logik
│   │   ├── game-state.js      # State Management
│   │   ├── resources-def.js   # Ressourcen-Definitionen
│   │   ├── upgrades-def.js    # Gebäude & Upgrades
│   │   ├── research-def.js    # Forschungs-Baum
│   │   ├── achievement-*.js  # Achievement-System
│   │   ├── prestige.js        # Prestige-Logik
│   │   └── prestige-upgrades.js
│   └── ...
├── ui/
│   ├── ui-init.js         # UI Initialisierung
│   └── ui-render.js       # Rendering-Logik
└── README.md
```

## 🚀 Installation & Development

### Lokal ausführen

```bash
# Repository klonen
git clone https://github.com/oliverlaudan-ops/Idle-Game-v2.git
cd Idle-Game-v2

# Mit einem lokalen Server starten (z.B. mit Python)
python -m http.server 8000

# Oder mit Node.js
npx http-server

# Im Browser öffnen
open http://localhost:8000
```

### Requirements

- Moderner Browser mit ES6+ Support
- LocalStorage aktiviert (für Speicherfunktion)
- Kein Build-Prozess nötig!

## 🎮 Game Balance & Tipps

### Anfänger-Tipps
1. **Klicke früh viel** - Kaufe Click-Upgrades für schnelleren Start
2. **Baue vielfältig** - Verschiedene Ressourcen ermöglichen mehr Optionen
3. **Forsche klug** - Priorisiere Effizienz-Forschungen
4. **Nutze Demolish** - Experimentiere ohne Angst (50% Refund!)
5. **Erweitere Bauplätze** - Mehr Platz = mehr Möglichkeiten

### Fortgeschrittene Strategien
- **Effizienz > Masse**: Effizienz-Upgrades sind oft besser als mehr Gebäude
- **Platz-Optimierung**: Große Gebäude (Size 3) sind produktiver pro Platz
- **Prestige-Timing**: Prestigen wenn du mind. 5+ Punkte bekommst
- **Achievement-Hunting**: Viele Achievements geben permanente Boni!

### Ressourcen-Ketten verstehen
```
Energie (Klick) → Alles braucht Energie!
  │
  ├── Wasser → Nahrung → Bevölkerung
  │
  ├── Gestein → Metall → Kristalle → Treibstoff
  │
  └── Bevölkerung → Forschung → Technologie-Boni
```

## 📊 Progression-Übersicht

| Meilenstein | Ziel | Beschreibung |
|-------------|------|-------------|
| **Early Game** | 100 Energy | Erste Solarpanels, Click-Upgrades |
| **Mid Game** | 1K Energy | Wasserproduktion, erste Forschungen |
| **Late Game** | 10K Energy | Industrialisierung, Kristalle, 40+ Bauplätze |
| **End Game** | 1M Energy | Fusionsreaktoren, Tier 3 Forschung, Prestige |
| **Post-Prestige** | Multiple Runs | Permanente Boni, 85 Bauplätze, alle Achievements |

## 🔄 Updates & Changelog

### Version 2.0 (Januar 2026)
- ✅ Vollständiges Achievement-System (40+ Achievements)
- ✅ Prestige-System mit permanenten Upgrades
- ✅ Demolish-Feature für Gebäude
- ✅ 5 Bauplatz-Erweiterungen (10 → 85 Plätze)
- ✅ Balancing-Verbesserungen
- ✅ UI/UX Optimierungen

## 👥 Contributing

Beiträge sind willkommen! Bitte:
1. Forke das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushe zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📝 Lizenz

Dieses Projekt ist unter der MIT License veröffentlicht.

## 💬 Kontakt

Oliver Laudan - [@oliverlaudan-ops](https://github.com/oliverlaudan-ops)

Projekt Link: [https://github.com/oliverlaudan-ops/Idle-Game-v2](https://github.com/oliverlaudan-ops/Idle-Game-v2)

---

⭐ Wenn dir das Spiel gefällt, gib dem Repo einen Star! ⭐
