#!/bin/bash
find server/src -type f -name "*.ts" -exec sed -i 's|\.\./\.\./\.\./shared/src|@ctor-game/shared|g' {} \;