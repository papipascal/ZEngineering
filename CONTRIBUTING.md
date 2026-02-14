# Guide de contribution - Zen-gineering

Merci de votre intérêt pour contribuer à Zen-gineering ! Ce document fournit les directives pour contribuer au projet.

## 🌟 Comment contribuer

### Signaler un bug

Si vous trouvez un bug, veuillez créer une issue avec :
- Une description claire et concise du problème
- Les étapes pour reproduire le bug
- Le comportement attendu vs le comportement observé
- Des captures d'écran si pertinent
- Votre environnement (OS, navigateur, version)

### Proposer une amélioration

Pour proposer une nouvelle fonctionnalité :
1. Vérifiez qu'elle n'existe pas déjà dans les issues
2. Créez une issue décrivant la fonctionnalité
3. Expliquez le cas d'usage et la valeur ajoutée
4. Attendez la validation avant de commencer le développement

### Soumettre du code

#### Workflow Git

1. **Fork** le repository
2. **Clone** votre fork localement
3. Créez une **branche** depuis `develop` :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   # ou
   git checkout -b fix/mon-correctif
   ```
4. **Commitez** vos changements avec des messages clairs
5. **Push** vers votre fork
6. Créez une **Pull Request** vers la branche `develop`

#### Conventions de nommage des branches

- `feature/nom-feature` - Nouvelles fonctionnalités
- `fix/nom-bug` - Corrections de bugs
- `docs/nom-doc` - Modifications de documentation
- `refactor/nom-refactor` - Refactoring de code
- `test/nom-test` - Ajout ou modification de tests
- `chore/nom-tache` - Tâches de maintenance

#### Conventions de commits

Utilisez des messages de commit descriptifs :

```
type(scope): description courte

Description détaillée si nécessaire

Closes #123
```

**Types de commits :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, pas de changement de code
- `refactor`: Refactoring
- `test`: Ajout de tests
- `chore`: Maintenance

**Exemples :**
```
feat(auth): ajout authentification 2FA
fix(email): correction extraction pièces jointes
docs(api): mise à jour documentation endpoints
refactor(validation): simplification workflow validation
```

## 💻 Standards de code

### Backend

- Suivre les conventions PEP 8 (Python) ou les standards du langage utilisé
- Documenter les fonctions et classes
- Écrire des tests unitaires
- Validation avec linter avant commit

### Frontend

- Suivre les conventions ESLint/Prettier configurées
- Composants réutilisables et modulaires
- Accessibilité (WCAG 2.1)
- Tests des composants critiques

### Base de données

- Migrations versionnées
- Documentation des schémas
- Optimisation des requêtes

## ✅ Checklist avant Pull Request

- [ ] Le code compile sans erreur
- [ ] Les tests passent localement
- [ ] Les nouveaux tests sont ajoutés si nécessaire
- [ ] La documentation est mise à jour
- [ ] Le code suit les conventions du projet
- [ ] Les commits sont clairs et logiques
- [ ] La PR a une description détaillée

## 🧪 Tests

### Lancer les tests

```bash
# Backend
npm test
# ou
pytest

# Frontend
npm run test

# Tests e2e
npm run test:e2e
```

### Couverture de code

Visez une couverture minimale de 80% pour les nouvelles fonctionnalités.

## 📝 Documentation

Toute nouvelle fonctionnalité doit être documentée :
- Commentaires dans le code
- Documentation API (OpenAPI/Swagger)
- Guide utilisateur si nécessaire
- Mise à jour du README

## 🔍 Revue de code

Tous les PRs seront revus par au moins un mainteneur. Soyez patient et réceptif aux commentaires.

### Critères de revue

- Qualité du code
- Respect des conventions
- Tests appropriés
- Performance
- Sécurité
- Documentation

## 🚀 Processus de release

1. Développement sur `develop`
2. Merge dans `staging` pour tests d'intégration
3. Merge dans `main` pour production
4. Tag de version (semantic versioning)

## 📞 Questions

Si vous avez des questions, n'hésitez pas à :
- Créer une issue avec le label `question`
- Contacter l'équipe via [canal de communication]

## 🙏 Remerciements

Merci à tous les contributeurs qui participent à l'amélioration de Zen-gineering !
