import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './db';  

// Definir os atributos da tabela 'Processos'
interface ProcessosAttributes {
    ORGAO: string;
    PROCESSO: string;
    MUNICIPIO: string;
    UF: string;
    TRIBUNAL: string;
    PROCEDIMENTO: string;
    DATA: Date;
    LIQUIDO: string;
    GRAU: string;
    TIPO?: string;       // Pode ser nulo
    ADVOGADO?: string;   // Pode ser nulo
}

// Definir os atributos opcionais (para quando criar um novo processo, alguns campos podem não ser fornecidos)
interface ProcessosCreationAttributes extends Optional<ProcessosAttributes, 'TIPO' | 'ADVOGADO'> {}

// Definir o modelo de Processos
class Processos extends Model<ProcessosAttributes, ProcessosCreationAttributes>
    implements ProcessosAttributes {
    public ORGAO!: string;
    public PROCESSO!: string;
    public MUNICIPIO!: string;
    public UF!: string;
    public TRIBUNAL!: string;
    public PROCEDIMENTO!: string;
    public DATA!: Date;
    public LIQUIDO!: string;
    public GRAU!: string;
    public TIPO?: string;    // Campo opcional
    public ADVOGADO?: string;  // Campo opcional
}

// Inicializar o modelo de Processos com Sequelize
Processos.init({
    ORGAO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    PROCESSO: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    MUNICIPIO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    UF: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TRIBUNAL: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    PROCEDIMENTO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    DATA: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    LIQUIDO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    GRAU: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TIPO: {
        type: DataTypes.STRING,
        allowNull: true,  // Pode ser nulo
    },
    ADVOGADO: {
        type: DataTypes.STRING,
        allowNull: true,  // Pode ser nulo
    },
}, {
    sequelize,  // Conexão com o banco de dados
    modelName: 'Processos',  // Nome do modelo
    tableName: 'Processos',  // Nome da tabela no banco de dados
});

export default Processos;
