"""Fictional people / companies / titles. Nothing here is a real person or a registered brand."""
from __future__ import annotations

FIRST_ES = ["Alejandro", "Andrea", "Camila", "Carlos", "Carolina", "Claudia", "Daniel", "Diana", "Diego",
            "Elena", "Emilio", "Fernanda", "Gabriel", "Gabriela", "Guillermo", "Héctor", "Isabel", "Javier",
            "Jorge", "José", "Juan", "Julián", "Karla", "Laura", "Leticia", "Luis", "Manuel", "Marcela",
            "María", "Mariana", "Mauricio", "Mónica", "Natalia", "Nicolás", "Óscar", "Pablo", "Patricia",
            "Paula", "Rafael", "Ricardo", "Roberto", "Rocío", "Santiago", "Sebastián", "Sofía", "Tomás",
            "Valentina", "Verónica", "Víctor", "Ximena", "Adriana", "Andrés", "Beatriz", "César", "Dulce",
            "Esteban", "Francisco", "Ignacio", "Lorena", "Miguel", "Pilar", "Raúl", "Sergio", "Teresa"]
LAST_ES = ["García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez", "Ramírez",
           "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales", "Cruz", "Ortiz", "Gutiérrez",
           "Chávez", "Ramos", "Vargas", "Castillo", "Jiménez", "Moreno", "Romero", "Herrera", "Medina",
           "Aguilar", "Castro", "Vázquez", "Mendoza", "Ruiz", "Fernández", "Soto", "Rojas", "Silva",
           "Contreras", "Guerrero", "Salazar", "Navarro", "Domínguez", "Vega", "Peña", "Cárdenas", "Ibarra",
           "Valdés", "Paredes", "Lara", "Montoya", "Quintero", "Arias", "Cortés", "Escobar", "Pineda",
           "Zamora", "Bravo", "Ponce", "Acosta", "Maldonado"]
FIRST_PT = ["Ana", "Bruno", "Camila", "Carlos", "Daniela", "Eduardo", "Felipe", "Fernanda", "Gabriel",
            "Isabela", "João", "Juliana", "Larissa", "Leonardo", "Lucas", "Luiza", "Marcelo", "Mariana",
            "Mateus", "Patrícia", "Paulo", "Rafael", "Renata", "Rodrigo", "Tatiana", "Thiago", "Vanessa",
            "Vinícius", "Beatriz", "Cláudio"]
LAST_PT = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima",
           "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes",
           "Vieira", "Barbosa", "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques",
           "Machado", "Mendes", "Freitas"]
FIRST_EN = ["Alex", "Daniel", "David", "Emily", "James", "Jessica", "Michael", "Rachel", "Sarah", "Thomas",
            "Andrew", "Laura", "Mark", "Nicole", "Peter"]

SDR_NAMES = ["Valeria Montes", "Andrés Quiroga", "Lucía Barrientos", "Mateo Salinas"]  # fictional Clara SDRs

STEMS = ["al", "ta", "vi", "mer", "cu", "ro", "sol", "ka", "nex", "lu", "min", "do", "ver", "ri", "pan", "gi",
         "tra", "bel", "fo", "ren", "sa", "mar", "pi", "lo", "cen", "tor", "yra", "ba", "qui", "zu", "ne",
         "va", "dor", "ten", "ma", "ci", "gal", "per", "ni", "to", "ar", "em", "or", "ul", "ix", "ca", "jo",
         "fer", "lis", "mo"]

# function -> seniority -> titles (ES / PT)
TITLES_ES = {
    "finance": {"c_level": ["CFO", "Director Financiero"], "vp": ["VP de Finanzas"],
                "director": ["Director de Finanzas", "Director de Tesorería", "Controller"],
                "manager": ["Gerente de Finanzas", "Gerente de Tesorería", "Gerente de Cuentas por Pagar"],
                "ic": ["Analista Financiero", "Analista de Cuentas por Pagar", "Contador"]},
    "procurement": {"c_level": ["Chief Procurement Officer"], "vp": ["VP de Compras"],
                    "director": ["Director de Compras", "Director de Abastecimiento"],
                    "manager": ["Gerente de Compras"], "ic": ["Analista de Compras", "Comprador"]},
    "operations": {"c_level": ["COO"], "vp": ["VP de Operaciones"], "director": ["Director de Operaciones"],
                   "manager": ["Gerente de Operaciones"], "ic": ["Coordinador de Operaciones"]},
    "it": {"c_level": ["CTO"], "vp": ["VP de Tecnología"], "director": ["Director de TI"],
           "manager": ["Gerente de TI"], "ic": ["Analista de Sistemas"]},
    "hr": {"c_level": ["CHRO"], "vp": ["VP de Recursos Humanos"], "director": ["Director de Recursos Humanos"],
           "manager": ["Gerente de Recursos Humanos"], "ic": ["Analista de Recursos Humanos"]},
    "executive": {"c_level": ["CEO", "Director General", "Fundador"], "vp": ["VP Ejecutivo"],
                  "director": ["Director General Adjunto"], "manager": ["Asistente de Dirección"],
                  "ic": ["Asistente de Dirección"]},
    "other": {"c_level": ["Director de Administración"], "vp": ["VP de Administración"],
              "director": ["Director Administrativo"], "manager": ["Gerente Administrativo"],
              "ic": ["Asistente Administrativo"]},
}
TITLES_PT = {
    "finance": {"c_level": ["CFO", "Diretor Financeiro"], "vp": ["VP de Finanças"],
                "director": ["Diretor de Finanças", "Diretor de Tesouraria", "Controller"],
                "manager": ["Gerente de Finanças", "Gerente de Tesouraria", "Gerente de Contas a Pagar"],
                "ic": ["Analista Financeiro", "Analista de Contas a Pagar", "Contador"]},
    "procurement": {"c_level": ["Chief Procurement Officer"], "vp": ["VP de Suprimentos"],
                    "director": ["Diretor de Compras", "Diretor de Suprimentos"],
                    "manager": ["Gerente de Compras"], "ic": ["Analista de Compras", "Comprador"]},
    "operations": {"c_level": ["COO"], "vp": ["VP de Operações"], "director": ["Diretor de Operações"],
                   "manager": ["Gerente de Operações"], "ic": ["Coordenador de Operações"]},
    "it": {"c_level": ["CTO"], "vp": ["VP de Tecnologia"], "director": ["Diretor de TI"],
           "manager": ["Gerente de TI"], "ic": ["Analista de Sistemas"]},
    "hr": {"c_level": ["CHRO"], "vp": ["VP de Recursos Humanos"], "director": ["Diretor de Recursos Humanos"],
           "manager": ["Gerente de Recursos Humanos"], "ic": ["Analista de Recursos Humanos"]},
    "executive": {"c_level": ["CEO", "Diretor Geral", "Fundador"], "vp": ["VP Executivo"],
                  "director": ["Diretor Geral Adjunto"], "manager": ["Assistente de Diretoria"],
                  "ic": ["Assistente de Diretoria"]},
    "other": {"c_level": ["Diretor Administrativo"], "vp": ["VP Administrativo"],
              "director": ["Diretor Administrativo"], "manager": ["Gerente Administrativo"],
              "ic": ["Assistente Administrativo"]},
}

ERPS = ["SAP Business One", "Oracle NetSuite", "Contpaqi", "Siigo", "Totvs", "Defontana", "Bsale", "Odoo"]
PRODUCTS = ["una plataforma de pedidos en línea", "una nueva línea de productos premium",
            "una aplicación móvil para clientes", "un servicio de entrega en 24 horas",
            "una línea sustentable", "un programa de lealtad"]
LOST_REASONS = ["precio", "eligieron banco actual", "sin presupuesto", "sin respuesta", "timing"]
