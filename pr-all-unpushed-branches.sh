#!/bin/bash
# first, create a list of all local branches
LOCAL_BRANCHES=$(git for-each-ref --format='%(refname:short)' refs/heads/)

# remove all branches that have a remote tracking branch
LOCAL_BRANCHES=$(echo "$LOCAL_BRANCHES" | while read BRANCH; do
    if [ -z "$(git for-each-ref --format='%(upstream:short)' refs/heads/$BRANCH)" ]; then
        echo "$BRANCH"
    fi
done)

# then, remove branches that have been pushed to the remote
# shellcheck disable=SC2001
LOCAL_BRANCHES_FORMATTED=$(echo "$LOCAL_BRANCHES" | sed 's|^|refs/heads/|')

REMOTE_BRANCHES=$(git ls-remote origin --heads "$LOCAL_BRANCHES_FORMATTED" | awk '{print $2}' | sed 's|refs/heads/||')
for BRANCH in $REMOTE_BRANCHES; do
    LOCAL_BRANCHES=$(echo "$LOCAL_BRANCHES" | grep -v "^$BRANCH$")
done

# now, LOCAL_BRANCHES contains only branches that have not been pushed to the remote
# for each of these branches, create a pull request using the GitHub CLI
for BRANCH in $LOCAL_BRANCHES; do
    # echo "Creating pull request for branch: $BRANCH"
    # push the branch to the remote
    if ! git push -u origin "$BRANCH"; then
        echo "Failed to push branch: $BRANCH"
        continue
    fi

    PR_EXISTS=$(gh pr list --head "$BRANCH" --json number --jq '.[].number')
    if [ -z "$PR_EXISTS" ]; then
        echo "Creating pull request for branch: $BRANCH"
        if ! gh pr create -B develop -d -H "$BRANCH" -f -a "@me"; then
            echo "Failed to create pull request for branch: $BRANCH"
            continue
        else
            echo "Pull request created for branch: $BRANCH"
        fi
    else
        echo "Pull request already exists for branch: $BRANCH (PR #$PR_EXISTS)"
    fi
done
