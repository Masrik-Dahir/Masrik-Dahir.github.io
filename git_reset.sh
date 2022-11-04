# Adding files
git checkout --orphan latest_branch
git add -A
git add .gitignore

# .gitignore
git rm -r --cached -f ./Demo/*
git rm -r --cached -f ./.idea/*

touch .gitignore
truncate -s 0 .gitignore
echo '.idea/*' >> .gitignore
echo 'Demo/*' >> .gitignore

# delete previous branch and commit again
git commit -am "everything has been reset"
git branch -D master
git branch -m master
git push -f origin master