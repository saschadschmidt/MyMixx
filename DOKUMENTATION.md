# MyMixx-Müsli Konfigurator
Autor: Sascha Schmidt
Klasse: 6MEM3
Lernfeld: LF6
Lehrer: PFF, MUM, DOI

# Informationen

## Müsli-Optionen
Die Müsli-Optionen werden in folgender Datei gespeichert:
/konfigurator/assets/items.json (im JSON Format)

## Müsli-App
Die Applikation wird über die app.js gesteuert
/konfigurator/assets/items.json

## Bestätigung
Die Bestätigung führt eine Löschung des localStorages aus. Diese befindet sich in
/konfigurator/assets/bestaetigung.js
in den letzten Zeilen (nur die localStorage Zeien) können kann die Funktion des Storage löschens deaktiviert werden, indem es auskommentiert wird.

# Voraussetzungen
Browser: jeder aktuelle Browser (getestet mit Opera/Chromium & Safari/Webkit)
JavaScript: muss aktiviert werden (falls deaktiviert)
PHP: nicht verwendet
Extensions: möglichst deaktivieren, könnte zu Problemem führen

# Installation
Alle Dateien zusammen in der gleichen Struktur in den htdocs (MAMP, XAMPPS, o.Ä.) Ordner ziehen.
Webserver starten
Testen

# Funktionsweise
Müsli-Optionen (Items) wurden auf 10g / 100ml runter gerechnet und in definierten Schritten abgegeben.
Es muss ein 5€ Mindestwert erreicht werden, damit man in den Warenkorb kommt.