# Multi-Repository Setup

This project uses three repositories for separate release tracks.

## Repository Roles

- Development website: https://github.com/BuildingAi-Cloud/super-octo-rotary-phone.git
- Beta testing website: https://github.com/BuildingAi-Cloud/Website-Beta.git
- Mobile app track (Android APK): https://github.com/BuildingAi-Cloud/symmetrical-palm-tree.git

## Remote Names in This Workspace

- `origin` -> development website repository
- `demo-repository` -> beta testing website repository
- `palm-tree` -> mobile app repository

## Recommended Workflow

1. Implement and review features in the development repo (`origin`).
2. Run checks before publishing:
   - `npm run build`
   - `npm run lint`
   - `npm test`
3. Push approved beta snapshot to `demo-repository` branch `website-beta`.
4. Keep mobile packaging and APK-specific changes in `palm-tree`.

## Useful Commands

Check remotes:

```bash
git remote -v
```

Push current branch to beta track:

```bash
git push demo-repository HEAD:website-beta
```

Push current branch to mobile track:

```bash
git push palm-tree HEAD:main
```

## Notes

- Do not merge beta-only experiments directly into `master` without review.
- Keep environment and release notes updated when promoting from development to beta.
