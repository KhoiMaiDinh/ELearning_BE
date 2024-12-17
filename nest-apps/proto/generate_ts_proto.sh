#!/bin/bash
# RUN SCRIPT: ./generate_ts_proto.sh ./<name>.proto

# Variables
# NOTE: Change the plugin path to your pc absolute path before running the script
PLUGIN_PATH="D:\ProjectCode\FinalProject\ELearning_BE\nest-apps\node_modules\.bin\protoc-gen-ts_proto.CMD"
OUTPUT_DIR="./generated"

# Check if a proto file argument is provided
if [ -z "$1" ]; then
  echo "❌ Error: No .proto file specified."
  echo "Usage: ./generate_ts_proto.sh <proto_file>"
  exit 1
fi

PROTO_FILE="$1"

# Check if the specified file exists
if [ ! -f "$PROTO_FILE" ]; then
  echo "❌ Error: File '$PROTO_FILE' not found."
  exit 1
fi

# Create the output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Run the protoc command for the specified proto file
echo "Generating TypeScript definitions for $PROTO_FILE..."
protoc \
  --plugin=protoc-gen-ts_proto=$PLUGIN_PATH \
  --ts_proto_out=$OUTPUT_DIR \
  --ts_proto_opt=nestJs=true \
  $PROTO_FILE

echo "✅ TypeScript proto generation completed for $PROTO_FILE!"