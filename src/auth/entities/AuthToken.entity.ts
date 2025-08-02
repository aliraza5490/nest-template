import { EntityBase } from "@/shared/entities/Base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class AuthToken extends EntityBase {
  @Column()
  type: string;

  @Column()
  token: string;

  @Column()
  identifier: string;

  @Column()
  TTL: Date;
}
