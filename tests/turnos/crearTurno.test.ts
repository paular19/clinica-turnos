import { crearTurno } from "../../lib/actions/serverTurnos";
import { prisma } from "../../lib/db/prisma";
import * as email from "../../lib/email/sendConfirmationEmail";

jest.mock("../../lib/db/prisma");
jest.mock("../../lib/email/sendConfirmationEmail");

describe("crearTurno", () => {
  it("should validate input and attempt transaction", async () => {
    (prisma.$transaction as any) = jest.fn().mockImplementation(async (fn: any) => {
      return fn(prisma);
    });

    (prisma.paciente.upsert as any) = jest.fn().mockResolvedValue({
      id: "pac-1",
      nombre: "Juan",
      apellido: "Perez",
      dni: "12345678",
      email: "a@b.com"
    });

    (prisma.turno.create as any) = jest.fn().mockResolvedValue({
      id: "turno-1",
      codigo: "ABC12345",
      fecha: new Date().toISOString()
    });

    (email.sendConfirmationEmail as any) = jest.fn().mockResolvedValue("msg-1");

    const input = {
      clinicId: "00000000-0000-0000-0000-000000000000",
      profesionalId: "00000000-0000-0000-0000-000000000001",
      especialidadId: "00000000-0000-0000-0000-000000000002",
      fecha: new Date().toISOString(),
      paciente: {
        nombre: "Juan",
        apellido: "Perez",
        dni: "12345678",
        email: "a@b.com"
      }
    };

    const res = await crearTurno(input as any);
    expect(res).toHaveProperty("codigo");
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(email.sendConfirmationEmail).toHaveBeenCalled();
  });
});
