# Analyse du projet cote server

Ce document a pour but de comprendre ce code pour pouvoir le reutiliser.

## Description
Le serveur gere l'API des joueurs, l'enregistrement des matchs, le calcul de
l'Elo des joueurs et le stockage en base de donnees.

## Les joueurs
Fonctionnalites :
- Routes CRUD (players.controller)
- Logique CRUD (players.service)
- Definition de l'entite player (player.entity)
- API simple pour creer un joueur (player-api.controller)

## Matchs et classement
Fonctionnalites :
- Enregistrer un match et mettre a jour l'Elo
- Recuperer le classement (top, position, estimation)
- Routes ranking (ranking.controller)
- Logique ranking (ranking.service)
- Calcul Elo (elo.service)
- API simple pour poster un match par nom (match-api.controller)

## API "simple"
Les fichiers `match-api.controller` et `player-api.controller` exposent des
endpoints simplifies (noms au lieu d'IDs), distincts de l'API "complete".

## Evenements
Des evenements internes sont emis lors des changements (joueur cree/modifie,
match enregistre) puis diffuses en SSE aux clients via les controllers d'events.
