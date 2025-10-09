const queryMainTable = `
             CREATE TABLE IF NOT EXISTS patients (
                        id TEXT PRIMARY KEY NOT NULL ,
                        i_name TEXT  , 
                        i_emp_code TEXT ,
                        name TEXT , 
                        dob TEXT,
                        age INTEGER,
                        gender TEXT,
                        lat INTEGER,
                        long INTEGER,
                        date TEXT,
                        time TEXT , 
                        created_at TEXT ,
                        updated_at TEXT ,
                        updated_by TEXT DEFAULT 'UNKNOWN',
                        tab_id TEXT
                    ); 
            
            CREATE TABLE IF NOT EXISTS residential_history (
                        id TEXT PRIMARY KEY  NOT NULL , 
                        user_id TEXT NOT NULL , 
                        from_age INTEGER , 
                        to_age INTEGER , 
                        city TEXT , 
                        village TEXT , 
                        state TEXT , 
                        code INTEGER , 
                        tab_id TEXT
                 );
            CREATE TABLE IF NOT EXISTS personal_medical_history (
                        id TEXT PRIMARY KEY NOT NULL ,
                        diagnoss TEXT  , 
                        diagnosed INTEGER ,  
                        age_first_diagnosis INTEGER ,
                        year_of_first_diagnosis TEXT ,
                        treatment_received INTEGER ,
                        mode_of_treatment TEXT ,
                        mode_of_diagnosis TEXT ,
                        mode_of_diagnosis_other TEXT ,
                        user_id TEXT,
                        tab_id TEXT
                 );
         CREATE TABLE IF NOT EXISTS TOBACCO_ALCOHOL_CONSUMPTION (
              id TEXT PRIMARY KEY,
              user_id TEXT,
              type TEXT,
              product TEXT,
              consumes INTEGER,
              from_age INTEGER,
              to_age INTEGER,
              number_per_day INTEGER,
              days_in_week INTEGER,
              days_in_month INTEGER,
              duration_placement_hr INTEGER,
              duration_placement_min INTEGER,
              site_of_placement_L INTEGER,
              site_of_placement_R INTEGER,
              site_of_placement_F INTEGER,
              site_of_placement_NA INTEGER,
              without_tobacco INTEGER,
              consumption_unit_per_day INTEGER,
              is_other_product INTEGER,
              tab_id TEXT ,
              master_id TEXT 
             );
        CREATE TABLE IF NOT EXISTS ENDOSCOPY (
            id TEXT PRIMARY KEY, 
            vial_code TEXT ,
            endoscopy_video_filename TEXT , 
            endoscopy_pdf_filename TEXT,
            user_id TEXT ,
            date TEXT,
            tab_id TEXT
        );
        CREATE TABLE IF NOT EXISTS blood_sample (
            id TEXT PRIMARY KEY , 
            user_id TEXT , 
            date_collected TEXT , 
            time_collected TEXT , 
            last_meal_date TEXT , 
            last_meal_time TEXT , 
            received_blood_last_6_months INTEGER , 
            sample_classification TEXT , 
            is_sample_collected INTEGER,
            tab_id TEXT 
        );
        CREATE TABLE IF NOT EXISTS blood_tube_collection (
            id TEXT PRIMARY KEY , 
            blood_collection_tube TEXT , 
            blood_collection_tube_other , 
            identification_code_tube , 
            volume INTEGER , 
            characteristic TEXT , 
            blood_sample_id TEXT,
            tab_id TEXT
        );
        CREATE TABLE IF NOT EXISTS gtgh_blood_report (
            id TEXT PRIMARY KEY ,
            test_name TEXT , 
            result REAL , 
            unit TEXT , 
            sampleId TEXT ,
            test_type TEXT ,
            sample_id TEXT,
            tab_id TEXT
        );
        CREATE TABLE IF NOT EXISTS tablet_data (
              id INTEGER PRIMARY KEY ,
              tab_id TEXT
        );
        CREATE TABLE IF NOT EXISTS anthropometry (
              id TEXT PRIMARY KEY NOT NULL ,
              user_id TEXT ,
              date TEXT ,
              height REAL ,
              weight REAL ,
              tab_id TEXT
        ); 
     CREATE TABLE IF NOT EXISTS indoor_air_pollution (
              id TEXT PRIMARY KEY NOT NULL,
              from_age INTEGER,
              to_age INTEGER,
              hours INTEGER,
              minutes INTEGER,
              ventilation INTEGER,
              most_common_cooking_fuel INTEGER,
              smokiness INTEGER,
              most_cooking INTEGER,
              user_id TEXT,
              tab_id TEXT
        ); 
      CREATE TABLE IF NOT EXISTS TOBACCO_ALCOHOL_CONSUMPTION_MASTER (
                id TEXT PRIMARY KEY , 
                type TEXT , 
                user_id TEXT ,
                consumed INTEGER , 
                tab_id TEXT 
        );
       CREATE TABLE IF NOT EXISTS demographic_info (
               id TEXT PRIMARY KEY ,
               user_id TEXT,
               religion TEXT,
               marital_status TEXT,
               highest_education TEXT,
               highest_education_spouse TEXT,
               household_income TEXT,
               mother_tongue TEXT,
               place_of_birth TEXT,
               tab_id TEXT
        );
`

  //synch flag -> 0 1 2
        // 0 -> never synched
        // 1 -> synched
        // 2 -> updated
export {queryMainTable} ;
const queryTrackTables = `
    
`