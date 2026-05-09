#!/usr/bin/env bash

set -euo pipefail

main_file="${1:-main.tex}"
output_dir="${2:-output}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
main_path="$script_dir/$main_file"
output_path="$script_dir/$output_dir"

if [[ ! -f "$main_path" ]]; then
  echo "Cannot find '$main_file' in $script_dir." >&2
  exit 1
fi

mkdir -p "$output_path"

if command -v latexmk >/dev/null 2>&1 && command -v perl >/dev/null 2>&1; then
  exec latexmk -pdf -interaction=nonstopmode -halt-on-error -outdir="$output_path" "$main_path"
fi

if ! command -v pdflatex >/dev/null 2>&1; then
  echo "Neither 'latexmk' nor 'pdflatex' was found on PATH. Install a LaTeX distribution such as TeX Live or MiKTeX." >&2
  exit 1
fi

pdflatex -interaction=nonstopmode -halt-on-error -output-directory="$output_path" "$main_path"
pdflatex -interaction=nonstopmode -halt-on-error -output-directory="$output_path" "$main_path"