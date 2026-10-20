const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const swc = require('next/dist/build/swc');

async function load(file, mocks = {}) {
  const exports = {};
  const result = await swc.transform(fs.readFileSync(file, 'utf8'), {
    filename: file,
    jsc: { parser: { syntax: 'typescript', tsx: file.endsWith('.tsx') }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  });
  vm.runInNewContext(result.code, { exports, require: name => name in mocks ? mocks[name] : require(name), process, console, window: {} });
  return exports;
}

(async () => {
  await swc.loadBindings();
  const THREE = await import('three');
  const store = await load('lib/flight-store.ts');
  const data = await load('data/flight.ts');
  const route = await load('lib/flight-route.ts', { '@/data/flight': data, './flight-store': store });
  const point = { x: 0, y: 0, z: 0 };
  for (let t = 0; t <= data.TAKEOFF_START; t += .001) assert.equal(route.sampleAltitude(t),0);
  assert.ok(route.sampleForward(data.TAKEOFF_START) < -60, 'A meaningful ground roll must precede lift-off');
  const derivative = (f,t,h=.000001) => (f(t+h)-f(t-h))/(2*h);
  assert.ok(Math.abs(derivative(route.sampleForward,0)) < .1);
  assert.ok(Math.abs(derivative(route.sampleForward,1)) < .1);
  for (const t of [data.TAKEOFF_START,data.CRUISE_START,data.LANDING_START,data.TOUCHDOWN_AT]) {
    assert.ok(Math.abs(derivative(route.sampleAltitude,t)) < .01, 'Vertical speed settles at phase boundaries');
    assert.ok(Math.abs(derivative(route.sampleForward,t-.00001)-derivative(route.sampleForward,t+.00001)) < 3, 'Forward speed continuous at phase boundary');
  }
  let previous = route.sampleForward(0);
  for (let t = .0001; t <= 1; t += .0001) {
    const next = route.sampleForward(t); assert.ok(next <= previous); previous = next;
    assert.ok(Math.abs(route.samplePitch(t)) < .07);
  }
  assert.equal(route.samplePitch(.29),0);
  assert.equal(route.sampleAltitude(1),0);
  assert.equal(route.sampleLateral(1),0);
  const sections = data.FLIGHT_SCENES.filter(s => s.id !== 'start');
  assert.ok(sections[0].at-sections[0].span > data.CRUISE_START+.04);
  for (const section of sections) {
    assert.equal(route.sampleAltitude(section.at),data.CRUISE_ALTITUDE);
    assert.equal(route.departureVisibility(section.at),0);
    assert.equal(route.arrivalVisibility(section.at),0);
    assert.ok(section.at+section.span < data.LANDING_START);
  }
  for (const target of [0,.1,.5,1]) {
    let current = .3;
    for (let i=0;i<90;i++) { const next=route.scrubProgress(current,target,1/60); assert.ok(Math.abs(next-target)<=Math.abs(current-target)); current=next; }
    assert.equal(current,target,'Scrub must settle rather than fly indefinitely');
  }
  assert.equal(route.scrubProgress(0,0,1/60),0,'No input means no takeoff');

  for (const [width,height] of [[390,844],[768,1024],[1366,768],[1920,1080]]) {
    let frame, aircraft;
    const camera = new THREE.PerspectiveCamera(38,width/height,.1,700);
    const rig = await load('components/3d/FlightRig.tsx', {
      three: THREE,
      react: {useMemo:f=>f(),useRef:()=>({current:aircraft=new THREE.Group()})},
      '@react-three/fiber':{useFrame:f=>{frame=f;},useThree:()=>({camera,size:{width,height}})},
      '@/data/flight':data,'@/lib/flight-store':store,'@/lib/flight-route':route,
      './AircraftModel':{AircraftModel:()=>null},
    });
    rig.FlightRig({src:'',placeholder:true});
    const states=[];
    for(let t=0;t<=1;t+=.002) {
      store.flightState.progress=t; frame(); aircraft.updateMatrixWorld(); camera.updateMatrixWorld();
      const corners=[];
      for(const x of [-1.55,1.55]) for(const y of [-.15,.55]) for(const z of [-.75,2.2])
        corners.push(new THREE.Vector3(x,y,z).applyMatrix4(aircraft.matrixWorld).project(camera));
      const left=Math.min(...corners.map(v=>v.x)),right=Math.max(...corners.map(v=>v.x));
      const top=Math.max(...corners.map(v=>v.y)),bottom=Math.min(...corners.map(v=>v.y));
      assert.ok(left>-.98 && right<.98 && top<.96 && bottom>-.96,`Aircraft clipped at ${width}, ${t}`);
      for(const section of sections) if(store.scenePresence(t,section.at,section.span)>.5) {
        if(width<640) assert.ok(bottom>.16,`Mobile aircraft enters reading area at ${t}`);
        else if(section.side==='left') assert.ok(left>-.1,`Aircraft overlaps left panel at ${width},${t}`);
        else assert.ok(right<.1,`Aircraft overlaps right panel at ${width},${t}`);
      }
      states.push({t,position:aircraft.position.toArray(),rotation:aircraft.quaternion.toArray(),camera:camera.position.toArray()});
    }
    for(const state of states.reverse()) {
      store.flightState.progress=state.t;frame();
      assert.deepEqual(aircraft.position.toArray(),state.position,'Reverse scroll position differs');
      assert.deepEqual(aircraft.quaternion.toArray(),state.rotation,'Reverse scroll attitude differs');
      assert.deepEqual(camera.position.toArray(),state.camera,'Camera lags independently');
    }
    const before=aircraft.position.toArray(); for(let i=0;i<120;i++)frame();
    assert.deepEqual(aircraft.position.toArray(),before,'Stopped scroll must stay stopped');
  }
  console.log('PASS: ground roll, continuous phase velocities, shallow pitch, stable cruise, touchdown/stop, bounded scrub, reverse determinism and unclipped/non-overlapping aircraft at 4 viewport sizes.');
})().catch(error => {console.error(error);process.exitCode=1;});
