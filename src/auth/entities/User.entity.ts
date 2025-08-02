import { EntityBase } from "@/shared/entities/Base.entity";
import { generatePasswordHash } from "@/shared/utils/bcrypt";
import { BeforeInsert, Column, Entity } from "typeorm";

@Entity()
export class User extends EntityBase {
  @Column({ type: "varchar" })
  firstName: string;

  @Column({ type: "varchar" })
  lastName: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean;

  @BeforeInsert()
  async beforeInsert() {
    this.password = await generatePasswordHash(this.password);
  }
}
