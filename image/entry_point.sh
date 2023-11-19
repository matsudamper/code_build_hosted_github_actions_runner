#!/usr/bin/env bash

 (sleep 30 && if [ "$(find /actions-runner/_diag/Runner_*.log | xargs cat | grep -c "Running job")" != "1" ];then
    RUNNING_JOB_COUNT="$(find /actions-runner/_diag/Runner_*.log | xargs cat | grep -c "Running job")"
    echo "RUNNING_JOB_COUNT=$RUNNING_JOB_COUNT"
    exit 1;
 else
    exit 0;
fi) &
RUNNING_JOB_COUNT_PID=$!

RUNNER_ALLOW_RUNASROOT=1 /actions-runner/run.sh --jitconfig $ENCODED_JIT_CONFIG &
RUNNER_PID=$!

wait $RUNNING_JOB_COUNT_PID

if [ "$?" == "1" ]; then
    exit 1;
else
    wait $RUNNER_PID
fi
