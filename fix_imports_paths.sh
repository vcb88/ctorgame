#!/bin/bash
find server/src -type f -name "*.ts" -exec sed -i 's|@ctor-game/shared/types/game/|@ctor-game/shared/types/game/|g' {} \;
find server/src -type f -name "*.ts" -exec sed -i 's|@ctor-game/shared/types/base/|@ctor-game/shared/types/base/|g' {} \;
find server/src -type f -name "*.ts" -exec sed -i 's|@ctor-game/shared/types/storage/|@ctor-game/shared/types/storage/|g' {} \;
find server/src -type f -name "*.ts" -exec sed -i 's|@ctor-game/shared/utils/|@ctor-game/shared/utils/|g' {} \;
find server/src -type f -name "*.ts" -exec sed -i 's|@ctor-game/shared/validation/|@ctor-game/shared/validation/|g' {} \;