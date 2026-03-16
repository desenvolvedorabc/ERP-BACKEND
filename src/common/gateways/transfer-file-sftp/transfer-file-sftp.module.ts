import { Module } from "@nestjs/common";
import { TransferFileSftpGateway } from "./transfer-file-sftp.gateway";

@Module({
  providers: [TransferFileSftpGateway],
  exports: [TransferFileSftpGateway],
})
export class TransferFileSftpModule {}
