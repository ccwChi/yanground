import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';



export default function ForSummaryStepper({activeStep, steps}) {
    
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label} className="">
            <StepLabel className='!text-xs' sx={{'span span':{fontSize:"0.75rem"}}}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

// 最陽春的step使用方法，在steps列出你有幾個執行步驟，activeStep是目前正在第幾步，由0開始計算，在外面設state傳進來
// ex: const steps = ['建立施工清單','新增修改工程執行','工程執行派工'];   [activeStep, setActiveStep]=useState(0) 