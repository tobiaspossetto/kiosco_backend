# kiosco_backend
## Backend para kiosco ProA
### Información de la API:
  * Diseñada para que el kiosco no maneje continuamente dinero sino que solo se haga un abono inicial, obteniendolo como proaTokens (1 peso = 1 proaToken) y que cada cliente pueda pagar transfiriendo al kiosco de sus proaTokens disponibles.
   * Trabaja con roles: admin y usuarios.
   * Un usuario puede iniciar sesión con una cuenta creada por el admin, puede cambiar su contraseña, acceder a su historial de transferencias de proaTokens al kiosco y su historial de recargas. Tambien puede ver cuantos proaTokens tiene disponibles.
   * Un admin puede crear, editar y eliminar un usuario asi como ver sus datos, su historial de transferencias y recargas y puede acreditarle proaTokens si el usuario abona dinero para recargas.
## Para correr el servidor:
  * Clonar e instalar dependencias con el comando npm install
### Librerias y modulos:
 * Express
 * Express-validator
 * bcriptjs
 * JWT
 * nodemon
### Documentacion
  * Aclaración: los campos username y password deben ser mayores o iguales a 6 caracteres
  
  #### ADMINISTRADORES:
  * VER TODOS LOS USUARIOS -> users/  GET  
  * VER USUARIO ESPECIFICO -> users/:id  GET 
  * CREAR USUARIO NUEVO -> users/ POST  body -> username : string, email : string, admin : bool, password : string, proaTokens : int, student : bool, year : int(1-7), division : string(a-b) -> Dejar vacio campo year o division si no es estudiante
  * EDITAR USUARIO -> users/:id PATCH  body -> email : string, admin : bool, username : string -> Son los valores que se pueden editar
  * ELIMINAR USUARIO -> users/:id  DELETE
  * RECARGAR PROATOKENS -> users/recharge -> POST  body -> clientUsername:string, quantity:int
  
  #### CLIENTES 
   * Tanto administradores como clientes tienen que iniciar sesión
   * Cambiar la contraseña es lo primero que se debe hacer al obtener una cuenta
   * Los administradores tambien pueden hacer transferencias al kiosco
   * INICIAR SESIÓN -> login/ POST  body -> username : string, password : string Se devuelve un token que se guarda en la cabecera para acceder a rutas protegidas bajo el nombre de 'auth', guardarlo en una Cookie , dura 2hs y se tiene que renovar pasado ese tiempo.
   * CAMBIAR CONTRASEÑA -> login/change-password POST  body -> oldPassword : string, newPassword : string, confirmNewPassword : string
   * INFORMACIÓN DE USUARIO -> login/profile GET 
   * TRANSACCIÓN AL KIOSCO -> users/transaction POST  body -> quantity : int, quantityConfirm : int
