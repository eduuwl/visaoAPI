import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './db';  


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
    TIPO?: string;     
    ADVOGADO?: string;   
}


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
    public TIPO?: string;    
    public ADVOGADO?: string; 
}


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
        allowNull: true,  
    },
    ADVOGADO: {
        type: DataTypes.STRING,
        allowNull: true,  
    },
}, {
    sequelize,  
    modelName: 'Processos',  
    tableName: 'Processos',  
});

export default Processos;
