#!/bin/bash
# Thin entrypoint for the USA data lab grow loop.
# Shared logic lives in code/usa-uk-data-stack/loops/loop-wrapper.sh.
exec "$HOME/code/usa-uk-data-stack/loops/loop-wrapper.sh" \
  "$HOME/code/usa-data-lab" \
  "$HOME/code/usa-data-lab/scripts/grow-loop-prompt.txt" \
  "$HOME/code/usa-data-lab/scripts/heal-grow-loop-prompt.txt" \
  usa-data-lab
