#include <nan.h>

int fib(int param){
  if(param <= 1){
      return param;
  };
  return fib(param - 1) + fib(param - 2);
}

void fibCPP(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();

  double arg = info[0]->NumberValue(context).FromJust();
  double result = fib(arg);
  v8::Local<v8::Number> num = Nan::New(result);

  info.GetReturnValue().Set(num);
}

void Init(v8::Local<v8::Object> exports) {
  v8::Local<v8::Context> context =
      exports->GetCreationContext().ToLocalChecked();
  exports->Set(context,
               Nan::New("fibCPP").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(fibCPP)
                   ->GetFunction(context)
                   .ToLocalChecked());
}

NAN_MODULE_WORKER_ENABLED(addon, Init)