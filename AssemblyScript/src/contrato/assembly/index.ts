import { PersistentUnorderedMap, logging, context, u128, ContractPromiseBatch } from 'near-sdk-as'

const ONE_NEAR = u128.from('1000000000000000000000000');

/*
|-----------------------------------------
| Creamos una clase llamada concursante
|-----------------------------------------
*/

@nearBindgen
class clsConcursante {
  nombre:string;
  apellido:string;
  cedula:u32;
  correo:string;
  numero:u32;
 
  //Inicializamos el objeto
  constructor(nombre:string,apellido:string,cedula:u32,correo:string,numero:u32) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.cedula = cedula;
    this.correo = correo;
    this.numero = numero;
  }
}

//Creamos una colección para almacenar información en nuestro contrato.
export const concursantes = new PersistentUnorderedMap<string, clsConcursante>("p");

//MÉTODOS DEL CONTRATO:

/**
 * Método de ESCRITURA para registrar un nuevo concursante
 * El comando para utilizarlo en la terminal es:
 *  >> near call $CONTRATO setConcursante '{"nombre":"NOMBRE","apellido":"APELLIDO","cedula":14000000,"correo":"CORREO@CORREO.COM","numero":11}' --accountId cuenta.near --amount 1
 *    * $CONTRATO es una variable que contiene el id de la cuenta del contrato
 * 
 * @param nombre string que requiere el nombre del concursante a registrar
 * @param apellido string que requiere el apellido del concursante a registrar
 * @param cedula entero de 32 bits sin signo que requiere la cedula del participante
 * @param correo string que requiere el correo electronico del concursante a registrar
 * @param numero entero de 32 bits sin signo que requiere el numero de la rifa vendida
 * 
 * Es necesario enviarle 1 NEAR (o más) como pago a este método.
 */
export function setConcursante(nombre:string,apellido:string,cedula:u32,correo:string,numero:u32): void {

  //Usamos el context de la transacción para obtener datos de la misma.
  const cuenta = context.sender;
  const deposito = context.attachedDeposit;

  //Hacemos validaciones. Queremos que:
  //* El nombre tenga más de 3 caractéres.
  //* El apellido tenga más de 3 caractéres.
  //* Cedula debe ser mayor a cero.
  //* Correo debe tener una longitud minima de 7.
  //* Numero de Ticket debe ser mayor a Cero.

  //* Paguen 1 NEAR cada que se registren
  assert(nombre.length >= 3, "El nombre debe contener 3 o más caractéres.");
  assert(apellido.length >= 3, "El apellido debe contener 3 o más caractéres.");
  assert(cedula > 0, "Cedula inválida.");
  assert(correo.length>= 7, "El correo debe contener 7 o más caractéres.");
  assert(numero > 0, "El numero de Ticket es invalido.");

  assert(deposito >= ONE_NEAR, "Debes de pagar 1 NEAR para registrarte.");

  //Instanciamos la clase (creamos un objeto) y le mandamos los datos al constructor.
  let concursante = new clsConcursante(nombre,apellido,cedula,correo,numero);

  //Guardamos la información en la blockchain.
  //PersistentUnorderedMap requiere una clave y el dato a guardar.
  //Para más información consulta: https://docs.near.org/docs/concepts/data-storage#persistentunorderedmap
  concursantes.set(cuenta,concursante);

  //Le enviamos un mensaje de confirmación a la consola.
  logging.log("Registro creado exitosamente.");
}

/**
 * Método de LECTURA que regresa un participante
 * El comando para utilizarlo en la terminal es:
 *  >> near view $CONTRATO getConcursante '{"cuenta":"CUENTA.NEAR"}'
 * @param cuenta string que contiene la cuenta (key) del usuario a consultar
 * @returns Concursante
 */
export function getConcursante(cuenta: string): clsConcursante | null {
  return concursantes.get(cuenta);
}

/**
 * Método de LECTURA que regresa toda la lista de concursantes registrados
 * El comando para utilizarlo en la terminal es:
 *  >> near view $CONTRATO getConcursantes '{}'
 * @returns Participante[] (Arreglo de participantes)
 */
export function getConcursantes(): clsConcursante[] {
  return concursantes.values();
}

/*
|-----------------------------------------------------
| CODIGO COMENTADO PERO SE TIENE PENSADO USAR PARA 
| GUARDAR EL TICKET VENDIDO COMO CERTIFICADO
|-----------------------------------------------------
*/ 

/**
 * Método de ESCRITURA para certificar a un participante
 * Además, transfiere 5 NEAR como compensación al participante que se haya certificado.
 * El comando para utilizarlo en la terminal es:
 *  >> near call $CONTRATO setCertificado '{"cuenta":"cuenta.near"}' --accountId cuenta.near --amount 1
 * 
 * @param cuenta string que contiene la cuenta del participante a certificar
 * @returns bool: Regresa verdadero o falso dependiendo de si se ejecutó la acción.
 */

/*
export function setCertificado(cuenta: string): bool {

  //Si la cuenta ejecutando el comando no es aklassen.testnet, no podrá hacerse ningún cambio.
  assert(context.sender == "aklassen.testnet", "No tienes permisos para ejecutar este comando.");

  let participante = concursantes.get(cuenta);

  //Necesitamos evaluar si la línea de arriba encontró al participante.
  if (participante && participante.certificado == false) {
    participante.certificado = true;

    //Le transferimos al participante 5 NEAR como premio por haber logrado su certificación.
    ContractPromiseBatch.create(cuenta).transfer(u128.mul(ONE_NEAR, u128.from(5)));

    concursantes.set(cuenta, participante);
    logging.log("Participante certificado. El participante ha recibido su recompensa de 5 NEAR.");

    return true;
  }
  else {
    logging.log("Participante no encontrado o participante ya certificado.");
    return false;
  }


}

*/