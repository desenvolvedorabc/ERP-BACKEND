import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Client as SSHClient, ConnectConfig } from "ssh2";
import { from, Observable } from "rxjs";
import { catchError, concatMap } from "rxjs/operators";
import * as path from "path";

@Injectable()
export class TransferFileSftpGateway {
  private createSSHClient(): SSHClient {
    return new SSHClient();
  }

  private connect(config: ConnectConfig): Observable<SSHClient> {
    return new Observable((observer) => {
      const ssh = this.createSSHClient();

      ssh.on("ready", () => {
        observer.next(ssh);
        observer.complete();
      });

      ssh.on("error", (err) => {
        console.error("SSH connection error:", err);
        observer.error(err);
      });

      ssh.on("close", () => {
        console.error("SSH connection closed.");
      });

      ssh.connect(config);
    });
  }

  private execCommand(ssh: SSHClient, command: string): Observable<string> {
    return new Observable((observer) => {
      ssh.exec(command, (err, stream) => {
        if (err) {
          return observer.error(err);
        }

        let output = "";
        stream
          .on("close", () => {
            observer.next(output);
            observer.complete();
          })
          .on("data", (data: Buffer) => {
            output += data.toString();
          })
          .stderr.on("data", (data: Buffer) => {
            observer.error(data.toString());
          });
      });
    });
  }

  private sendFile(
    sftp: any,
    fileName: string,
    content: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const remotePath = `${process.env.STCPCLT_SAIDA_PATH || 'C:\\\\STCPCLT_BRADESCO\\\\O0055BRADESCO\\\\SAIDA'}\\${fileName}`;
      const writeStream = sftp.createWriteStream(remotePath);

      writeStream.on("close", resolve);
      writeStream.on("error", reject);
      writeStream.write(content, (err: Error) => {
        if (err) {
          reject(err);
        } else {
          writeStream.end();
        }
      });
    });
  }

  async sendFilesToVanBradesco(
    files: { fileName: string; content: string }[],
  ): Promise<string> {
    const { SSH_HOST, SSH_PORT, SSH_USERNAME, SSH_PASSWORD } = process.env;

    if (!SSH_HOST || !SSH_USERNAME || !SSH_PASSWORD) {
      throw new HttpException(
        "SSH connection credentials are missing",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const config: ConnectConfig = {
      host: SSH_HOST,
      port: parseInt(SSH_PORT || "22", 10),
      username: SSH_USERNAME,
      password: SSH_PASSWORD,
    };

    return new Promise((resolve, reject) => {
      this.connect(config)
        .pipe(
          concatMap((ssh) =>
            new Observable((observer) => {
              ssh.sftp((err, sftp) => {
                if (err) {
                  return observer.error(err);
                }

                Promise.all(
                  files.map((file) =>
                    this.sendFile(sftp, file.fileName, file.content),
                  ),
                )
                  .then(() => observer.complete())
                  .catch((err) => observer.error(err));
              });
            }).pipe(
              concatMap(() =>
                this.execCommand(
                  ssh,
                  `${process.env.STCPCLT_EXE_PATH || 'C:\\\\STCPCLT_BRADESCO\\\\program\\\\stcpclt.exe'} "${process.env.STCPCLT_INI_PATH || 'C:\\\\STCPCLT_BRADESCO\\\\CTCP.INI'}" -p ${process.env.STCPCLT_PROFILE || 'O0055BRADESCO'} -r 5 -t 30 -m S -w 0`,
                ),
              ),
              catchError((err) => {
                console.error("Error Send CNAB to VAN:", err);
                ssh.end();
                return from([`Error: ${err.message}`]);
              }),
            ),
          ),
        )
        .subscribe({
          complete: () => resolve("Command executed successfully."),
          error: (err) => reject(err),
        });
    });
  }

  async retrieveFilesFromVanBradesco(): Promise<string> {
    const { SSH_HOST, SSH_PORT, SSH_USERNAME, SSH_PASSWORD } = process.env;

    if (!SSH_HOST || !SSH_USERNAME || !SSH_PASSWORD) {
      throw new HttpException(
        "SSH connection credentials are missing",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const config: ConnectConfig = {
      host: SSH_HOST,
      port: parseInt(SSH_PORT || "22", 10),
      username: SSH_USERNAME,
      password: SSH_PASSWORD,
    };

    return new Promise((resolve, reject) => {
      this.connect(config)
        .pipe(
          concatMap((ssh) =>
            this.execCommand(
              ssh,
              `${process.env.STCPCLT_EXE_PATH || 'C:\\\\STCPCLT_BRADESCO\\\\program\\\\stcpclt.exe'} "${process.env.STCPCLT_INI_PATH || 'C:\\\\STCPCLT_BRADESCO\\\\CTCP.INI'}" -p ${process.env.STCPCLT_PROFILE || 'O0055BRADESCO'} -r 5 -t 30 -m R -w 0`,
            ).pipe(
              concatMap(
                () =>
                  new Observable((observer) => {
                    ssh.sftp((err, sftp) => {
                      if (err) {
                        return observer.error(err);
                      }

                      sftp.readdir(
                        process.env.STCPCLT_ENTRADA_PATH || "C:\\STCPCLT_BRADESCO\\O0055BRADESCO\\ENTRADA",
                        (err, list) => {
                          if (err) {
                            return observer.error(err);
                          }

                          const files = list
                            .filter((item) => item.attrs.isFile())
                            .map((item) => ({
                              filename: item.filename,
                              attrs: item.attrs,
                            }))
                            .sort((a, b) => b.attrs.mtime - a.attrs.mtime);

                          if (files.length === 0) {
                            return observer.error(
                              new Error("No files found in the directory."),
                            );
                          }

                          const mostRecentFile = files[0].filename;
                          const remoteFilePath = path.join(
                            process.env.STCPCLT_ENTRADA_PATH || "C:\\STCPCLT_BRADESCO\\O0055BRADESCO\\ENTRADA",
                            mostRecentFile,
                          );

                          sftp.readFile(remoteFilePath, (err, data) => {
                            if (err) {
                              return observer.error(err);
                            }

                            observer.next(data.toString());
                            observer.complete();
                          });
                        },
                      );
                    });
                  }),
              ),
              catchError((err) => {
                console.error("Error retrieving files from VAN:", err);
                ssh.end();
                return from([`Error: ${err.message}`]);
              }),
            ),
          ),
        )
        .subscribe({
          next: (fileContent) => resolve(fileContent as string),
          error: (err) => reject(err),
        });
    });
  }
}
