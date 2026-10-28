ALTER TABLE `Product`
    ADD COLUMN `lastUpdatedBy` CHAR(36) NULL,
    ADD COLUMN `lastStockAdjustmentNote` VARCHAR(500) NULL;

CREATE INDEX `Product_lastUpdatedBy_idx` ON `Product`(`lastUpdatedBy`);

ALTER TABLE `Product`
    ADD CONSTRAINT `Product_lastUpdatedBy_fkey`
    FOREIGN KEY (`lastUpdatedBy`) REFERENCES `User`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
