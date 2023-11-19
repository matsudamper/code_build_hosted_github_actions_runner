#!/usr/bin/env bash

jitconfig=$(
    gh api \
        --method POST \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        /repos/$REPO_ORG/$REPO_NAME/actions/runners/generate-jitconfig \
        -f name=CodeBuild-$(uuid) \
        -F runner_group_id=1 \
        -f "labels[]=self-hosted" -f "labels[]=X64" -f "labels[]=Linux" \
        -f work_folder='work'
)
encoded_jit_config=$(echo $jitconfig | jq --raw-output .encoded_jit_config)
echo $encoded_jit_config
