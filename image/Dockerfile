FROM public.ecr.aws/ubuntu/ubuntu:latest

ENV ENCODED_JIT_CONFIG=
ARG RUNNER_VERSION=2.311.0
ARG RUNNER_FILE_NAME=actions-runner-linux-x64-$RUNNER_VERSION.tar.gz
ARG RUNNER_FILE_HASH=29fc8cf2dab4c195bb147384e7e2c94cfd4d4022c793b346a6175435265aa278

ENV NONINTERACTIVE=1
RUN apt-get -y update
RUN apt-get -y install \
    curl bash sudo unzip

RUN mkdir actions-runner && cd actions-runner \
    && curl -o actions-runner-linux-x64-2.311.0.tar.gz -L "https://github.com/actions/runner/releases/download/v$RUNNER_VERSION/$RUNNER_FILE_NAME" \
    && echo "$RUNNER_FILE_HASH $RUNNER_FILE_NAME" | sha256sum -c \
    && tar xzf "./$RUNNER_FILE_NAME"
RUN ./actions-runner/bin/installdependencies.sh

COPY entry_point.sh .
CMD ["/entry_point.sh"]
