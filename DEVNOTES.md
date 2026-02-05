# Notes for devs

- react-native-config is clamped to 1.5.6 because of https://github.com/facebook/react-native/issues/49888#issuecomment-3300821217

## Creating a release

```bash
# ensure clean state
git checkout main
git pull
git checkout develop
git pull

# bump version
yarn version <major|minor|patch>
yarn postversion
git add .

# create tag
git commit -m "Bump to v$(jq -r ".version" package.json)"
git tag -a -m "Bump to v$(jq -r ".version" package.json)" "v$(jq -r ".version" package.json)"

# push
git checkout main
git merge develop
git push
git checkout develop
git rebase main
git push
```
